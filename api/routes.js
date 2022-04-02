
/* routes.js */

import { Router } from 'oak'

import { extractCredentials, dataURLtoFile } from 'util'
import { login, register } from 'accounts'

const router = new Router()

// the routes defined here
router.get('/', async context => {
	console.log('GET /')
	context.response.headers.set('Content-Type', 'text/html')
	const data = await Deno.readTextFile('spa/index.html')
	context.response.body = data
})

router.get('/api/accounts', async context => {
	console.log('GET /api/accounts')
	const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)
	context.response.headers.set('Content-Type', 'application/json')
	try {
		const credentials = extractCredentials(token)
		console.log(credentials)
		const username = await login(credentials)
		console.log(`username: ${username}`)
		context.response.body = JSON.stringify(
			{
				data: { username }
			}, null, 2)
	} catch(err) {
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})

router.post('/api/accounts', async context => {
	console.log('POST /api/accounts')
	const body  = await context.request.body()
	const data = await body.value
	console.log(data)
	await register(data)
	context.response.status = 201
	context.response.body = JSON.stringify({ status: 'success', msg: 'account created' })
})

router.post('/api/files', async context => {
	console.log('POST /api/files')
	try {
		const token = context.request.headers.get('Authorization')
		console.log(`auth: ${token}`)
		const body  = await context.request.body()
		const data = await body.value
		console.log(data)
		dataURLtoFile(data.base64, data.user)
		context.response.status = 201
		context.response.body = JSON.stringify(
			{
				data: {
					message: 'file uploaded'
				}
			}
		)
	} catch(err) {
		context.response.status = 400
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
})

router.get("/(.*)", async context => {      
// 	const data = await Deno.readTextFile('static/404.html')
// 	context.response.body = data
	console.log('send index.html if nothing else matches')
	const data = await Deno.readTextFile('spa/index.html')
	context.response.headers.set('Content-Type', 'text/html')
	const path = `${Deno.cwd()}/spa/${context.request.url.pathname}`
	if(path.includes('.js')) context.response.headers.set('Content-Type', 'text/javascript')
	if(path.includes('.css')) context.response.headers.set('Content-Type', 'text/css')
	context.response.body = data
})

export default router

