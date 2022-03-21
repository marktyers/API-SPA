
/* acounts.test.js */

/*
integration tests for the /accounts route
*/

import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import { assert, assertEquals, assertNotEquals } from 'https://deno.land/std@0.129.0/testing/asserts.ts'

import app from './../../middleware.js'
import { delay } from '../../modules/util.js'

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
