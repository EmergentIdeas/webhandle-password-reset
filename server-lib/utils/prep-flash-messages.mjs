export default function prepFlashMessages(res) {
	if(!res.addFlashMessage) {
		res.addFlashMessage = function (msg, callback) {
			if(callback) {
				callback()
			}
		}
	}
}