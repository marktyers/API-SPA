
/* util.js */

import { etag, Status } from 'oak'
import { Base64 } from 'bb64'
import { Md5 } from 'md5'

export function extractCredentials(token) {
	console.log('checkAuth')
	if(token === undefined) throw new Error('no auth header')
	const [type, hash] = token.split(' ')
	console.log(`${type} : ${hash}`)
	if(type !== 'Basic') throw new Error('wrong auth type')
	const str = atob(hash)
	console.log(str)
	if(str.indexOf(':') === -1) throw new Error('invalid auth format')
	const [user, pass] = str.split(':')
	console.log(user)
	console.log(pass)
	return { user, pass }
}

// https://github.com/thecodeholic/deno-serve-static-files/blob/final-version/oak/staticFileMiddleware.ts
export async function staticFiles(context, next) {
	const path = `${Deno.cwd()}/static${context.request.url.pathname}`
  const isFile = await fileExists(path)
  if (isFile) {
		// file exists therefore we can serve it
    await context.send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/static`
    })
  } else {
    await next()
  }
}

export async function errorHandler(context, next) {
	try {
		const method = context.request.method
		const path = context.request.url.pathname
		console.log(`${method} ${path}`)
    await next()
  } catch (err) {
		console.log(err)
		context.response.status = Status.InternalServerError
		const msg = { err: err.message }
		context.response.body = JSON.stringify(msg, null, 2)
  }
}

// checks if file exists
export async function fileExists(path) {
  try {
    const stats = await Deno.lstat(path)
    return stats && stats.isFile
  } catch(e) {
    if (e && e instanceof Deno.errors.NotFound) {
      return false
    } else {
      throw e
    }
  }
}

export function saveFile(base64String, username) {
	console.log('save file')
	const [ metadata, base64Image ] = base64String.split(';base64,')
	console.log(metadata)
	const extension = metadata.split('/').pop()
	console.log(extension)
	const filename = `${username}-${Date.now()}.${extension}`
	console.log(filename)
	Base64.fromBase64String(base64Image).toFile(`./spa/uploads/${filename}`)
	console.log('file saved')
	return filename
}

export async function getEtag(path) {
	const stat = await Deno.stat(path)
	const tag = await etag.calculate(stat)
	return tag
}
