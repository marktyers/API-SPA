
/* middleware.js */

import { Application, send, Status } from 'oak'
import { extractCredentials, fileExists, getEtag } from 'util'
import { login } from 'accounts'
import { contentType } from 'mediaTypes'

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
		const data = {
			code: 415,
			title: '415 Unsupported Media Type',
			detail: 'This API supports the JSON:API specification, Content-Type must be application/vnd.api+json'
		}
		const err = new Error()
		err.data = data
		throw err
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
		const data = {
			code: 401,
			title: '401 Unauthorized',
			detail: 'the API uses HTTP Basic Auth and requires a correctly-formatted Authorization header'
		}
		const err = new Error()
		err.data = data
		throw err
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
		console.log('Authentication Error')
		console.log(err)
		err.data = {
			code: err.data.code || 401,
			title: err.data.title || '401 Unauthorized',
			detail: err.data.detail || err.message
		}
		throw err
	}

	await next()
}

async function staticFiles(context, next) {
	const path = `${Deno.cwd()}/spa/${context.request.url.pathname}`
	const isFile = await fileExists(path)
	if (isFile) {
		console.info('static file')
		// file exists therefore we can serve it
		const etag = await getEtag(path)
		context.response.headers.set('ETag', etag)
		const ext = context.request.url.pathname.split('.').pop()
		const mime = contentType(ext)
		console.log(`mime-type: ${mime}`)
		context.response.headers.set('Content-Type', mime)
		await send(context, context.request.url.pathname, {
			root: `${Deno.cwd()}/spa`,
		})
	} else {
		await next()
	}
}

async function errorHandler(context, next) {
	console.log('middleware: errorHandler')
  try {
    const method = context.request.method
    const path = context.request.url.pathname
    console.log(`\n${method} ${path}`)
    await next()
  } catch (err) {
	console.log('ERROR: errorHandler')
	console.log(err)
	if(err.data === undefined) {
		err.data = {
			code: Status.InternalServerError,
			title: '500 Internal Server error',
			details: err.message
		}
	}
		context.response.status = err.data.code
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: err.data.title,
						detail: err.data.detail
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

// last middle ware function serves up the html page
async function defaultResponse(context) {
	console.log('default page')
	const data = await Deno.readTextFile('spa/index.html')
	context.response.headers.set('Content-Type', 'text/html')
	context.response.body = data
}

app.use(errorHandler)
app.use(setHeaders)
app.use(staticFiles)
app.use(checkContentType)
app.use(authHeaderPresent)
app.use(validCredentials)
app.use(router.routes())
app.use(router.allowedMethods())
app.use(defaultResponse)

export default app
