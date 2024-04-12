import grecaptchaRequest from 'webhandle-emailer/grecaptcha-request.js'

export default async function handleGRecaptchaCheck(options, req) {
	let p = new Promise((resolve, reject) => {
		if (options.grecaptchaPrivate) {
			grecaptchaRequest(options.grecaptchaPrivate, req.body.grt, (err, answer) => {
				if (answer.success && answer.score >= options.requiredGrecaptchaScore) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			})
		}
		else {
			resolve(true)
		}

	})
	return p
}