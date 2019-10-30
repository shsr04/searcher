const Crawler = require('crawler')
const cheerio = require('cheerio')
const { saveRepoDetails, saveCodeFile } = require('./extract')
const { analyzeC } = require('./analyze')
const {log} =require("./log") 

let pages = new Set()
let RESTRICT = false
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
		if (!pageUrl.startsWith(baseUrl)) {
			done()		//e.g. after redirect
			return
		}
		log(`${res.statusCode} ${pageUrl}`, "TRACE")
		if (contentType.startsWith('text/html')) {
			const $ = cheerio.load(res.body)
			saveRepoDetails(pageUrl, $).then(() => {
				const code = $('.blob-wrapper')
				if (pageUrl.includes('/blob/master/') && code.length) {
					let analytics = {}
					let content = ''
					const suffix = pageUrl.slice(0, pageUrl.length - 1).split(".").pop()
					if (['c', 'h', 'cc', 'cpp', 'hpp'].includes(suffix)) {
						content = code.text()
						log(`analyzing ${pageUrl}`)
						analytics = analyzeC(pageUrl.split('/').pop(), content)
					}
					return saveCodeFile(pageUrl, content, analytics)
				}
				return Promise.resolve()
			}).then(() => {
				$('a').each((i, e) => {
					const href = $(e).attr('href')
					if (href && href.startsWith(baseUrl)) {
						addPage(href)
					}
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
	const b = a.origin + a.pathname
	return b.charAt(b.length - 1) != '/' ? b + '/' : b
}

/**
 * Add a page to the crawler queue
 * @param {string} p URL to queue
 */
function addPage(p) {
	if (!p) return
	let url = formatUrl(p)
	if (pages.size === 0) {
		if (RESTRICT) baseUrl = url
		else baseUrl = new URL(url).origin + "/"
		console.log('base', baseUrl)
	}
	if (!pages.has(url)) {
		pages.add(url)
		crawler.queue(url)
	}
}

function setRestrict(bool) {
	RESTRICT = bool
}

module.exports = { addPage, setRestrict }
