
/* FAKE db.js */

import { delay } from 'delay'

const lookup = {
	'SELECT count(id) AS count FROM accounts WHERE user="doej";' : [ { count: 1 } ],
	'SELECT count(id) AS count FROM accounts WHERE user="baduser";' : [ { count: 0 } ],
	'SELECT pass FROM accounts WHERE user = "doej";' : [ { pass: "$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO" } ]
}

export const db = {
	query: async sql => {
		// console.log(sql)
		// delay(200)
		const data = lookup[sql]
		// delay(200)
		// console.log(data)
		return data
	}
}
