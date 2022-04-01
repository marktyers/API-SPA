
/* accounts.test.js */

import { assertEquals } from 'asserts'
import { delay } from 'delay'

import { login } from 'accounts'

Deno.test('checks valid username and password', async () => {
	try {
		// arrange
		await delay(200)
		const data = { user: 'doej', pass: 'p455w0rd'}
		// act
		// await delay(200)
		const user = await login(data)
		// assert
		// await delay(200)
		assertEquals(user, 'doej', 'invalid username returned')
	} catch {
		assertEquals(true, false, 'error thrown')
	}
})
