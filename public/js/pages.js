/******/ var __webpack_modules__ = ({

/***/ "./node_modules/webhandle-emailer/client-js/make-form-recaptcha.js":
/*!*************************************************************************!*\
  !*** ./node_modules/webhandle-emailer/client-js/make-form-recaptcha.js ***!
  \*************************************************************************/
/***/ ((module) => {

/**
 * 
 * Configures forms to use Google Recaptcha by:
 * 1. Adding a hidden parameter which will contain information from google
 * 2. Adding onsubmit listners to catch submissions and contact google
 * for its assessment before the form is submitted to the server.
 * 
 * @param {string} googlePublicId The public google recaptcha key for this site
 * @param {string} formSelector The selector used to determine which forms receive recaptcha
 * 
 * @return null
 */
module.exports = function(googlePublicId, formSelector = '.google-recaptcha-form') {
	
	
	let recaptchaNeeded = true
	let forms = document.querySelectorAll(formSelector)

	if(forms && forms.length > 0) {
		let script = document.createElement('script')
		script.src = 'https://www.google.com/recaptcha/api.js?render=' + googlePublicId
		document.querySelector('head').appendChild(script)
	}

	function onSubmit(e) {
		let form = e.target
		if(grecaptcha && googlePublicId) {
			if(recaptchaNeeded) {
				e.preventDefault()
				grecaptcha.ready(function () {
					grecaptcha.execute(googlePublicId, { action: 'submit' }).then(function (token) {
						if(token) {
							recaptchaNeeded = false
							form.insertAdjacentHTML('beforeend', `<input type="hidden" name="grt" value="${token}" />`)
							form.removeEventListener('submit', onSubmit)
							setTimeout(function() {
								if(form.requestSubmit) {
									form.requestSubmit()
								}
								else {
									form.submit()
								}
							}, 100)
						}
					}).catch(function(err) {
						console.log(err)
					})
				})
			}
		}
	}

	for(let form of forms) {
		form.addEventListener('submit', onSubmit)
	}
}


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./client-js/pages.mjs ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var webhandle_emailer_client_js_make_form_recaptcha_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webhandle-emailer/client-js/make-form-recaptcha.js */ "./node_modules/webhandle-emailer/client-js/make-form-recaptcha.js");



if (window.recaptchaId && document.querySelectorAll('form.google-recaptcha-form').length > 0) {
	webhandle_emailer_client_js_make_form_recaptcha_js__WEBPACK_IMPORTED_MODULE_0__(window.recaptchaId)
}

})();


//# sourceMappingURL=pages.js.map