# @Webhandle / Emailed Password Reset

A very webhandle and webhandle emailer specific way of offering password reset.

## Install

```bash
npm install @webhandle/emailed-password-reset
```

## Usage

Basically, there's a page which takes an email address and submits it to a handler. The
handler then creates a unique token and then emails that token as part of a link to the
email address. 

Then there's a page which submits that token and the new passwords to a second handler. 
If all goes well, the second handler changes the user's password and then forwards the user
to a success url.


In practice, the handler code can probably be used as is but the pages will be customized for
site they'll be used on. There are three pages included as part of the package for requesting
a reset, performing the reset, and showing failure. There's also one view for sending the
email. It's my thought this will probably be used as starting points, not final markup.


### URLs

Everything is configurable, but by default the expected urls are going to be:

```
/password-reset/request-reset
/password-reset/perform-reset
/password-reset/failure
```

The default success url is `/login'


There is a listener for `/password-reset/perform-reset` which checks to see if there's a valid
`resetRequest` query parameter and forward to failure if not. This is only useful if the form pages
line up with the handler urls.


### Server side setup

Lots of options for the integration. Most have to do with specifying the urls and template name for
sending email. It's also set up to use webhandle-emailer's method of automated gRecaptcha. Just specify
the private key and required score.

The `siteUrl` or `redirectUrl` are really important so that the URL can be made absolute when sent to the user.

```js
import userInteractions from '@webhandle/emailed-password-reset'
router.use('/password-reset', userInteractions({
	siteUrl: 'http://localhost:3000'
	, templateName: 'reset-email'
	, from: 'server@example.com'
	, grecaptchaPrivate: process.env.grecaptchaPrivate
	, requiredGrecaptchaScore: .4
}))
```

### Pages and views
There's a pages directory and a views directory which you can just copy to start the site specific pages.


## Attacks and logging

There's a lot of logging and many checks for attacks. Emails are only sent if there's a user with that
email address. User messages are pretty vague. 

Passwords can only be set once per `resetRequest` id.

