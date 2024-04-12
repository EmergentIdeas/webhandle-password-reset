let appName = 'webhandle-password-reset'

module.exports = {
	/**
	 * Application configuration section
	 * http://pm2.keymetrics.io/docs/usage/application-declaration/
	 */
	apps: [{
		name: appName + '-web',
		script: './web-server.js',
		"env": {
			PORT: 3000,
			NODE_ENV: 'development'
			, trackerSecretKey: 'fac99ee61c211dda828e6259baec0a07'
			, dbs: [
				{
					"type": "mongodb",
					"dbName": "test",
					"url": "mongodb://localhost:27017/",
					"collectionNames": ["webhandleusers_users"]
				}
			]
			, webhandleEmail: {
				transport: {
					host: "smtp.example.com",
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: 'user',
						pass: 'pass'
					}
				},
				destDefault: "admin@example.com"
			}
			, "grecaptchaPublic": "something"
			, "grecaptchaPrivate": "else"
		}
	},
	{
		"name": appName + '-bg',
		"script": "npm",
		"args": "run pm2-bg"
	}
	]
};
