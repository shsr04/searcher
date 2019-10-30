const Crawler = require('crawler')
const cheerio = require('cheerio')
const { saveRepoDetails, saveCodeFile } = require('./extract')
const { fileType } = require('./store')
const { analyzeC } = require('./analyze')

let pages = new Set()
let baseUrl

const crawler = new Crawler({
	maxConnections: 10,
	retries: 2,
	retryTimeout: 1000,
	jQuery: false,
	callback: (err, res, done) => {
		if (err) throw err

		const contentType = res.headers['content-type']
		const pageUrl = formatUrl(res.request.uri.href)
		console.log(`${res.statusCode} ${pageUrl}`)
		if (contentType.startsWith('text/html')) {
			const $ = cheerio.load(res.body)
			saveRepoDetails(pageUrl, $).then(() => {
				const code = $('.blob-wrapper')
				if (pageUrl.includes('/blob/master/') && code.length) {
					const suffix = pageUrl.split('/').pop().split('.').pop()
					let analytics = {}
					if (['c', 'h', 'cc', 'cpp', 'hpp'].includes(suffix)) {
						analytics = analyzeC(pageUrl.split('/').pop(), code.text())
					}
					return saveCodeFile(pageUrl, fileType(suffix), code.text(), analytics)
				}
				return Promise.resolve()
			}).then(() => {
				$('a').each((i, e) => {
					addPage(formatUrl($(e).attr('href')))
				})
			}).then(() => {
				done()
			}).catch(e => {
				console.error(`Error while processing '${pageUrl}'\n`, e)
			})
		}
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
	if (!a) return undefined
	return a.origin + a.pathname
}

/**
 * Add a page to the crawler queue
 * @param {string} p URL to queue
 */
function addPage(p) {
	if (!p) return
	if (pages.size === 0) {
		baseUrl = p.charAt(p.length - 1) != '/' ? p + '/' : p
		console.log('base', baseUrl)
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
