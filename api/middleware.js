
/* middleware.js */

import { Application, send, Status } from 'oak'
// status codes https://deno.land/std@0.82.0/http/http_status.ts
// import { Md5 } from 'md5'
import { extractCredentials, fileExists, getEtag } from 'util'
import { login } from 'accounts'

import router from 'routes'

const app = new Application()

async function checkContentType(context, next) {
	console.log('middleware: checkContentType')

	const path = context.request.url.pathname
	const contentType = context.request.headers.get('Content-Type')

	// if not an API call content-type not important
	if(path.includes('/api/') === false) {
		await next()
		return // we don't want to continue this script on unwind
	}
	context.response.headers.set('content-type', 'application/vnd.api+json')
	if(contentType !== 'application/vnd.api+json') {
		console.log('wrong Content-Type')
		context.response.status = 415
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '415 Unsupported Media Type',
						detail: 'This API supports the JSON:API specification, Content-Type must be application/vnd.api+json'
					}
				]
			}
			, null, 2)
			return
	}

	await next()
	return
}

async function authHeaderPresent(context, next) {
	console.log('middleware: authHeaderPresent')

	const path = context.request.url.pathname
	const method = context.request.method

	// if not an API call content-type not important
	if(path.includes('/api/') === false) {
		await next()
		return // we don't want to continue this script on unwind
	}

	if(path === '/api/accounts' && method === 'POST') {
		console.log('account registration so auth header not needed')
		await next()
		return
	}

	if(context.request.headers.get('Authorization') === null) {
		console.log('missing Authorization header')
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '201 Unauthorized',
						detail: 'the API uses HTTP Basic Auth and requires a correctly-formatted Authorization header'
					}
				]
			}
		, null, 2)
		return
	}

	await next()
	return
}

async function validCredentials(context, next) {

	const path = context.request.url.pathname
	const method = context.request.method
	const token = context.request.headers.get('Authorization')

	// if not an API call content-type not important
	if(path.includes('/api/') === false) {
		console.log('not an API call so content-type not important')
		await next()
		return // we don't want to continue this script on unwind
	}

	// registering a new account so auth header not needed
	if(path === '/api/accounts' && method === 'POST') {
		await next()
		return
	}

	try {
		const credentials = extractCredentials(token)
		console.log(credentials)
		await login(credentials)
	} catch(err) {
		console.log('ERROR')
		console.log(err)
		console.log(`msg: ${err.message}`)
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized!',
						detail: err.message
					}
				]
			}
			, null, 2)
		return
	}

	await next()
}

async function staticFiles(context, next) {
	const path = `${Deno.cwd()}/spa/${context.request.url.pathname}`
	const isFile = await fileExists(path)
	if (isFile) {
		// file exists therefore we can serve it
		console.log(path)
		const etag = await getEtag(path)
		console.log(`etag: ${etag}`)
		context.response.headers.set('ETag', etag)
		if(path.includes('.css')) context.response.headers.set('Content-Type', 'text/css')
		if(path.includes('.js')) context.response.headers.set('Content-Type', 'application/javascript')
		await send(context, context.request.url.pathname, {
			root: `${Deno.cwd()}/spa`,
		})
	} else {
		await next()
	}
}

async function errorHandler(context, next) {
  try {
    const method = context.request.method;
    const path = context.request.url.pathname;
    console.log(`${method} ${path}`);
    await next();
  } catch (err) {
    console.log(err)
    context.response.status = Status.InternalServerError
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '500 Internal Server error',
						detail: err.message
					}
				]
			}
			, null, 2)
	}
	return
}

async function setHeaders(context, next) {
	console.log('setHeaders')
	// context.response.headers.set('content-type', 'application/vnd.api+json')
	context.response.headers.set('charset', 'utf-8')
	context.response.headers.set('Access-Control-Allow-Origin', '*')
	context.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	context.response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	context.response.headers.set('Access-Control-Allow-Credentials', true)
	await next()
}

app.use(errorHandler)
app.use(setHeaders)
app.use(checkContentType)
app.use(authHeaderPresent)
app.use(validCredentials)
app.use(staticFiles)
app.use(router.routes())
app.use(router.allowedMethods())

export default app