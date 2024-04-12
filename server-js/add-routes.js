
import path from "path"
import express from "express"
import filog from "filter-log"
import loadTemplates from "./add-templates.js"
import webhandle from "webhandle"
import userInteractions from '../server-lib/routers/user-interactions.mjs'
import enableUsers from './setups/enable-users.cjs'

let log

export default function(app) {
	let firstDb = Object.keys(webhandle.dbs)[0]
	let dbName = firstDb || "unknowndb"
	log = filog(dbName)

	// add a couple javascript based tripartite templates. More a placeholder
	// for project specific templates than it is a useful library.
	loadTemplates()

	if(firstDb) {
		if(process.env.initialAdminPassword) {
			// Add the user auth
			enableUsers(dbName, process.env.initialAdminPassword)
		}
		

		app.use('/password-reset', userInteractions({
			siteUrl: 'http://localhost:3000'
			, templateName: 'reset-email'
			, from: 'server@emergentideas.com'
			, grecaptchaPrivate: process.env.grecaptchaPrivate
			, requiredGrecaptchaScore: .4
		}))
	}		
	
	webhandle.routers.preStatic.get(/.*\.cjs$/, (req, res, next) => {
		console.log('cjs')
		res.set('Content-Type', "application/javascript")
		next()
	})

	webhandle.pageServer.preRun.push(async (req, res, next) => {
		// res.locals.config = (await webhandle.dbs[dbName].collections.configuration.find({configurationId: 'siteconfig'}).toArray())[0]
		res.locals.recaptchaId = process.env.grecaptchaPublic
		next()
	})
}

