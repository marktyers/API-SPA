
/* navigation.js */

import { highlightNav, router, triggerPageChange } from './util.js'

window.addEventListener('popstate', triggerPageChange)

document.querySelectorAll('nav a').forEach(element => element.addEventListener('click', router))

router()
