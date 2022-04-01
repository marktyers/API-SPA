
/* navigation.js */

import { router, highlightNav, getPageName } from './util.js'

window.addEventListener('popstate', router)

document.querySelectorAll('nav a').forEach(element => element.addEventListener('click', async event => {
	event.preventDefault()
	history.pushState(null, null, event.target.href)
	await router()
}))

router()
