
/* navigation.js */

/**
 * Adds event handlers to override the browser behaviour for
 * navigation links, back button clicks and first page load
 * @module navigation
 * @author Mark J Tyers <aa7401@coventry.ac.uk>
 * @license Creative-Commons-Attribution-NoDerivatives-4.0
 */

import { router } from './util.js'

document.addEventListener('DOMContentLoaded', event => {
	window.addEventListener('popstate', router)

	document.querySelectorAll('nav a').forEach(element => element.addEventListener('click', async event => {
		event.preventDefault()
		history.pushState(null, null, event.target.href)
		await router()
	}))

	router()
})
