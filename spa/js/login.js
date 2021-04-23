
/* login.js */

import { createToken, customiseNavbar, secureGet, loadPage, showMessage } from '../util.js'

export async function setup(node) {
	try {
		console.log('LOGIN: setup')
		console.log(node)
		document.querySelector('header p').innerText = 'Login Page'
		customiseNavbar(['home', 'register', 'login'])
		node.querySelector('form').addEventListener('submit', await login)
	} catch(err) {
		console.error(err)
	}
}

async function login() {
	event.preventDefault()
	console.log('form submitted')
	const formData = new FormData(event.target)
	const data = Object.fromEntries(formData.entries())
	const token = 'Basic ' + btoa(`${data.user}:${data.pass}`)
	const response = await secureGet('/accounts', token)
	console.log(response)
	if(response.status === 200) {
		localStorage.setItem('username', response.json.data.username)
		localStorage.setItem('authorization', token)
		showMessage('you are logged in')
		await loadPage('foo')
	} else {
		document.querySelector('input[name="pass"]').value = ''
		}
}
