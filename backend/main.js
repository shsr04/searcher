'use strict'
const http = require('http')
const crypto = require('crypto')
const fs = require('fs')
const { getRepos } = require('./extract')
const { log } = require('./log')

let unlocked = false
const encInput = fs.readFileSync('backend/inp', 'utf-8').trim()
let encOutput
const SALT = crypto.randomBytes(16)
const INIT_VEC = crypto.randomBytes(16)

function encrypt(key, inp) {
	const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(key, SALT, 32), INIT_VEC)
	return cipher.update(inp, 'utf-8', 'hex') + cipher.final('hex')
}

function getBody(req) {
	return new Promise((resolve, reject) => {
		let data = ''
		req.on('data', x => data += x)
		req.on('end', () => {
			resolve(data)
		})
		req.on('error', e => {
			reject(e)
		})
	})
}

const server = http.createServer(async (req, res) => {
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
	res.setHeader('Access-Control-Allow-Origin', '*')
	if (req.method=="OPTIONS") {
		res.writeHead(200)
		res.end()
		return
	}
	switch(req.method+' '+req.url) {
		case 'GET /repos':
			res.setHeader('Content-Type', 'application/json')
			const r = JSON.stringify(getRepos())
			res.write(r)
			break;
		case 'POST /unlock':
			const data = await getBody(req)
			const result = encrypt(data, encInput)
			if (result === encOutput) {
				log('UNLOCKING BACKEND')
				unlocked = true
				// setTimeout(() => { unlocked = false }, 10 * 1000)
			} else {
				log('key mismatch, backend remains locked')
				res.writeHead(401)
			}
			break;
		default:
			res.writeHead(400)
	}
	res.end()
})

async function main() {
	const password = fs.readFileSync('backend/key', 'utf-8').trim()
	encOutput = encrypt(password, encInput)
	server.listen(8020)
	//addPage('https://github.com/explore')
}

main().catch(e => {
	console.error('Searcher ERROR: ', e)
})
