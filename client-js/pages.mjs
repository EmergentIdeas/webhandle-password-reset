import recaptchaSetup from 'webhandle-emailer/client-js/make-form-recaptcha.js'


if (window.recaptchaId && document.querySelectorAll('form.google-recaptcha-form').length > 0) {
	recaptchaSetup(window.recaptchaId)
}
