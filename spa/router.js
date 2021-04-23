
/* router.js */

import { highlightNav,  triggerPageChange } from './util.js'

document.querySelectorAll('nav a').forEach(element => element.addEventListener('click', router))
router()

async function router(event) {
	if(event) { // has this been triggered by the click event?
		event.preventDefault()
		history.pushState(null, null, event.target.href)
	}
	await triggerPageChange()
}
