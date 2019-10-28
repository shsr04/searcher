const url = require('url')
const Crawler = require('crawler')
const cheerio = require('cheerio')
const { extractInfo } = require('./extract')

let pages = new Set()
let baseUrl

const crawler = new Crawler({
	maxConnections: 20,
	retries: 1,
	retryTimeout: 3000,
	jQuery: false,
	callback: (err, res, done) => {
		if (err) throw err

		const type = res.headers['content-type']
		const pageUrl = formatUrl(res.request.uri)
		//console.log(`${res.statusCode} ${pageUrl}`)
		if (type.startsWith('text/html')) {
			const $ = cheerio.load(res.body)
			extractInfo($)
			$('a').each((i, e) => {
				addPage(formatUrl($(e).attr('href')))
			})
		} else if (type.startsWith('text/plain')) {
			console.log('raw: ', pageUrl)
			if(pageUrl.endsWith('.cpp')) {
                
			}
		}

		done()
	}
})

function formatUrl(p) {
	if (!p) return undefined
	const a = url.format(p, { fragment: false, auth: false, search: false, unicode: true })
	const b = new URL(a, baseUrl)
	return b.href
}

function addPage(p) {
	if (!p) return
	let url = new URL(p)
	if (pages.size === 0) {
		baseUrl = url.origin
	} else if (url.origin !== baseUrl) {
		// console.log(`skipping outgoing URL ${url.origin}`)
		return
	}
	if (!pages.has(p)) {
		pages.add(p)
		crawler.queue(p)
	}
}

module.exports = { addPage }
