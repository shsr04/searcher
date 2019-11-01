'use strict'
const http = require('http')
const crypto = require('crypto')
const fs = require('fs')
const path = require("path")
const parseArgs = require('minimist')
const { addPage, setRestrict, ignorePath } = require('./pages')
const { initStorage, writeToDisk, allRepos } = require('./store')
const { log } = require('./log')

let needUnlock = false
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
	if (req.method == 'OPTIONS') {
		res.writeHead(200)
		res.end()
		return
	}
	switch (req.method + ' ' + req.url) {
		case 'GET /repos': {
			if (needUnlock && !unlocked) {
				res.writeHead(401)
				break
			}
			res.setHeader('Content-Type', 'application/json')
			const r = JSON.stringify(allRepos())
			res.write(r)
			break
		}
		case 'POST /unlock': {
			const data = await getBody(req)
			const result = encrypt(data, encInput)
			if (result === encOutput) {
				log('UNLOCKING BACKEND')
				unlocked = true
				// setTimeout(() => { unlocked = false }, 10 * 1000)
			} else {
				log('key mismatch, backend locked')
				unlocked = false
				res.writeHead(401)
			}
			break
		}
		default:
			res.writeHead(400)
	}
	res.end()
})

function initFolders() {
	for (let f of ['store', path.join('store', 'code')]) {
		const dir = path.join(__dirname, '..', f)
		if (!fs.existsSync(dir)) fs.mkdirSync(dir)
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2))
	if (args.h || args.help) {
		console.log('-s <url>\t\tset base URL\n-r\t\t\trestrict to child URLs of the base URL\n-i <string>\t\tignore any URLs containing `string`\n-e\t\t\tsecure access with crypto challenge')
		return
	}
	if (args.e) {
		needUnlock = true
		const password = fs.readFileSync('backend/key', 'utf-8').trim()
		encOutput = encrypt(password, encInput)
	}
	initFolders()
	await initStorage()
	if (args.i) for (let a of args.i) ignorePath(a)
	if (args.r) setRestrict(true)
	if (args.s) addPage(args.s)
	server.listen(8020)
}

process.on('SIGINT', () => {
	writeToDisk()
	process.exit()
})

main().catch(e => {
	console.error('Searcher ERROR: ', e)
})
