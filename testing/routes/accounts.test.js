
/* acounts.test.js */

/*
integration tests for the /accounts route
*/

import { superoak } from 'superOak'
import { assert, assertEquals, assertNotEquals } from 'asserts'

import app from 'middleware'
import { delay } from 'util'

// this is needed for the other tests to pass!
// should not be async.
Deno.test('DELAY', () => {
	const actual = 'application/vnd.api+json'
	const expected = 'application/vnd.api+json'
	assert(true)
})

Deno.test('check response returns correct content-type', async () => {
	const request = await superoak(app)
	const response = await request.get('/api/accounts')
	const contentType = response.header['content-type']
	const expected = 'application/vnd.api+json'
	assertEquals(contentType, expected, 'incorrect content-type returned')
})
