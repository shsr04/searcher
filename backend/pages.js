const url = require('url')
const Crawler = require('crawler')
const cheerio = require('cheerio')
const { saveRepoDetails, saveCodeFile } = require('./extract')
const { analyzeC } = require("./analyze")

let pages = new Set()
let baseUrl

const crawler = new Crawler({
	maxConnections: 10,
	retries: 2,
	retryTimeout: 1000,
	jQuery: false,
	callback: (err, res, done) => {
		if (err) throw err

		const type = res.headers['content-type']
		const pageUrl = formatUrl(res.request.uri.href)
		console.log(`${res.statusCode} ${pageUrl}`)
		if (type.startsWith('text/html')) {
			const $ = cheerio.load(res.body)
			const details = $('.repohead-details-container')
			if (details.length) {
				saveRepoDetails(pageUrl, $, details)
			}
			const code = $(".blob-wrapper")
			if (pageUrl.includes("/blob/master/") && code.length) {
				const type = pageUrl.split('/').pop().split('.').pop()
				let analytics = {}
				if (["c", "h", "cc", "cpp", "hpp"].includes(type)) {
					analytics = analyzeC(pageUrl.split('/').pop(), code.text())
				}
				saveCodeFile(pageUrl, type, code.text(), analytics)
			}
			$('a').each((i, e) => {
				addPage(formatUrl($(e).attr('href')))
			})
		}

		done()
	}
})

/**
 * Remove useless parts from request URI.
 * @param {string} p URL to format
 * @returns {string} base part of the URL
 */
function formatUrl(p) {
	if (!p) return undefined
	const a = new URL(p, baseUrl)
	if(!a) return undefined
	return a.origin + a.pathname
}

/**
 * Add a page to the crawler queue
 * @param {string} p URL to queue
 */
function addPage(p) {
	if (!p) return
	if (pages.size === 0) {
		baseUrl = p
	} else if (!p.startsWith(baseUrl)) {
		// console.log(`skipping outgoing URL ${url.origin}`)
		return
	}
	if (!pages.has(p)) {
		pages.add(p)
		crawler.queue(p)
	}
}

module.exports = { addPage }
