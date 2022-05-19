
/* accounts.js */

import { compare, genSalt, hash } from 'bcrypt'
import { db } from 'db'

const saltRounds = 10
const salt = await genSalt(saltRounds)

export async function login(credentials) {
	const { user, pass } = credentials
	let sql = `SELECT count(id) AS count FROM accounts WHERE user="${user}";`
	let records
	try {
		records = await db.query(sql)
	} catch(err) {
		console.log('connection login error thrown', err)
		err.data = {
			code: 500,
			title: '500 Internal server error',
			detail: 'the API database is currently down'
		}
		throw err
	}
	if(!records[0].count) {
		const err = new Error()
		err.data = {
			code: 401,
			title: '401 Unauthorized',
			detail: `username '${user}' not found`
		}
		throw err
	}
	sql = `SELECT pass FROM accounts WHERE user = "${user}";`
	records = await db.query(sql)
	const valid = await compare(pass, records[0].pass)
	if(valid === false) {
		const err = new Error()
		err.data = {
			code: 401,
			title: '401 Unauthorized',
			detail: `invalid password for account '${user}'`
		}
		throw err
	}
	return user
}

export async function register(credentials) {
	credentials.pass = await hash(credentials.pass, salt)
	const sql = `INSERT INTO accounts(user, pass) VALUES("${credentials.user}", "${credentials.pass}")`
	console.log(sql)
	await db.query(sql)
	return true
}
