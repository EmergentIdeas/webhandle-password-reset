
import express from 'express'

import webhandle from 'webhandle'
import Emailer from 'webhandle-emailer/webhandle-emailer.js'
import SessionStateInMemory from '@webhandle/session-state-in-memory'
import MongoDataService from "@dankolz/mongodb-data-service";
import filog from "filter-log"



import prepFlashMessages from '../utils/prep-flash-messages.mjs'
import genUniqueId from '../utils/gen-uniq-id.mjs';
import handleGRecaptchaCheck from '../utils/handle-recaptcha.mjs';

let mail = new Emailer()




let testing = false


/**
 * 
 * @param {object} options 
 * @param {string} options.from The address to send the email from
 * @param {string} options.emailTemplate Name of the template which is the email to send
 * @param {string} [options.siteName] To be used in the email. If missing the siteUrl will be used
 * @param {string} options.siteUrl The root of any url for the site like https://my.cool.site.com   Do not add a
 * terminating slash. This is used with the resetPage parameter. Not needed if using the resetLink parameter.
 * @param {string} options.resetPage The page, relativle to the siteUrl, which the user will be directed to in the
 * email to reset their password. A parameter will be added to this.
 * @param {string} options.resetLink Instead of specifying a siteUrl and resetPage, you can specify a reset link that
 * the user will be directed to in the email. A parameter will be added to this.
 * @param {string} options.subject The subject of the email.
 * @param {string} options.emailSentUrl Url to direct the user to after the email is sent.
 * @param {string} options.successUrl Url to direct the user to on successful change.
 * @param {string} options.failureUrl Url to direct the user to if change can not be completed.
 * @param {string} grecaptchaPrivate Google recaptcha's private key for evaluating the v3 check
 * @param {number} requiredGrecaptchaScore The score which the user must have before password reset will start. (0.4 by default)
 * @returns 
 */
export default function setup(options) {
	let log = filog('password-reset:')

	options = Object.assign({
		subject: "Reset Password"
		, emailTemplate: 'reset-email'
		, emailSentUrl: '/password-reset/email-sent'
		, successUrl: '/login'
		, failureUrl: '/password-reset/failure'
		, requiredGrecaptchaScore: .4
	}, options)

	let router = express.Router()
	let sessionState
	if (webhandle.services.sessionState) {
		sessionState = webhandle.services.sessionState
	}
	else {
		sessionState = new SessionStateInMemory()
	}

	let authService = webhandle.services.authService
	let users = new MongoDataService({
		collections: {
			default: authService.mongoUsersCollection
		}
	})

	router.post('/request-reset', async function (req, res, next) {
		let to = req.body.email
		if (!to || !(to.trim())) {
			log.debug('Password reset request for a blank email')
			res.redirect(options.failureUrl)
		}

		let passed = await handleGRecaptchaCheck(options, req)
		if(!passed) {
			log.debug('Password reset failed due to bad recaptcha')
			res.redirect(options.failureUrl)
		}

		let data = {
			email: req.body.email
			, siteName: options.siteName || options.siteUrl
			, siteUrl: options.siteUrl
			, resetLink: (options.resetLink || options.siteUrl + '/password-reset/perform-reset')
		}

		let found = await users.fetch({ email: to })
		if (found.length != 1) {
			log.error(`Password reset request for ${to} resulted in multiple users.`)
			res.redirect(options.failureUrl)
		}
		let user = found[0]

		if (!user.email) {
			log.debug(`Password reset request for ${to} resulted in no destination address.`)
			res.redirect(options.failureUrl)
		}

		let resetId = genUniqueId()
		sessionState.set(resetId, user)

		let url = new URL(data.resetLink)
		data.resetLink += url.search ? '&' : '?'
		data.resetLink += `resetRequest=${resetId}`

		log.info(`Password reset request for ${to} and user name ${user.name} sent. Reset ID ${resetId}.`)
		mail.sendEmail({
			to: to
			, from: options.from
			, subject: options.subject
			, emailTemplate: options.emailTemplate
			, data: data
		})

		res.redirect(options.emailSentUrl)
	})

	router.get('/perform-reset', async function (req, res, next) {
		if(!req.query.resetRequest) {
			log.error(`Received perform password reset with no reset id.`)
			res.redirect(options.failureUrl)
			return
		}

		let user = await sessionState.get(req.query.resetRequest)
		if (!user) {
			log.error(`Received perform password reset form page request for request ${req.body.resetRequest} but there was no user associated with it.`)
			res.redirect(options.failureUrl)
			return
		}

		next()
	})

	router.post('/perform-reset', async function (req, res, next) {
		// If we don't have a flash messages turned on, stub them out.
		prepFlashMessages(res)

		if(!req.body.resetRequest) {
			log.error(`Received perform password reset with no reset id.`)
			res.redirect(options.failureUrl)
			return
		}

		log.info(`Perform password reset for request ${req.body.resetRequest}.`)
		let user = await sessionState.get(req.body.resetRequest)
		if (!user) {
			log.error(`Received perform password reset for request ${req.body.resetRequest} but there was no user associated with it.`)
			res.addFlashMessage("We could not reset the password.", () => {
				res.redirect(options.failureUrl)
			})
			return
		}
		
		if(req.body.password != req.body.passwordConfirmed) {
			log.error(`Received perform password reset for request ${req.body.resetRequest}  user ${user.name} email ${user.email} but passwords did not match.`)
			res.addFlashMessage("Passwords did not match", () => {
				res.redirect(req.headers['referer'])
			})
			return

		}

		if((!req.body.password) || (!req.body.password.trim())) {
			log.error(`Received perform password reset for request ${req.body.resetRequest}  user ${user.name} email ${user.email} but password was blank.`)
			res.addFlashMessage("Passwords did not match", () => {
				res.redirect(req.headers['referer'])
			})
			return

		}

		authService.findUser(user.name, (err, found) => {
			if(err || !found) {
				log.error(`Received perform password reset for request ${req.body.resetRequest} but could not load user ${found.name}`)
				res.addFlashMessage("We could not reset the password.", () => {
					res.redirect(options.failureUrl)
				})
				return
			}

			authService.updatePass(found, req.body.password)
			authService.save(found, (err) => {
				log.info(`Perform password reset for request ${req.body.resetRequest} and user ${found.name} with email ${found.email}.`)
				sessionState.delete(req.body.resetRequest)
				res.addFlashMessage('Your password has been changed.', () => {
					res.redirect(options.successUrl)
				})
			})
		})

	})
	
	
	router.sessionState = sessionState
	router.authService = authService
	router.options = options


	return router

}



