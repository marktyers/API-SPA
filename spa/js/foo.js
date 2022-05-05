
/* foo.js */

console.log('FOO')

import { customiseNavbar, file2DataURI, loadPage, router, secureGet, showMessage } from '../util.js'

export async function setup(node) {
	console.log('FOO: setup')
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'Foobar'
		customiseNavbar(['home', 'logout', 'foo'])
		if(localStorage.getItem('authorization') === null) {
			history.pushState(null, null, '/login')
			await router()
		}
		// there is a token in localstorage
		node.querySelector('form').addEventListener('submit', await uploadData)
		console.log(window.location)
		node.querySelector('#href').innerText = window.location.href
		node.querySelector('#pathname').innerText = window.location.pathname
		node.querySelector('#search').innerText = window.location.search
		node.querySelector('#hash').innerText = window.location.hash
	} catch(err) {
		console.error(err)
	}
}

async function uploadData(event) {
	console.log('func UPLOAD DATA')
	event.preventDefault()
	const element = document.querySelector('input[name="file"]')
	console.log(element)
	const file = document.querySelector('input[name="file"]').files[0]
	file.base64 = await file2DataURI(file)
	file.user = localStorage.getItem('username')
	console.log(file)
	const url = '/api/files'
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/vnd.api+json',
			'Authorization': localStorage.getItem('authorization')
		},
		body: JSON.stringify(file)
	}
	const response = await fetch(url, options)
	console.log(response)
	const json = await response.json()
	console.log(json)
	showMessage('file uploaded')
	loadPage('home')
}
