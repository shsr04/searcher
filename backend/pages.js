const Crawler = require('crawler')
const cheerio = require('cheerio')
const { saveRepoDetails, saveCodeFile } = require('./extract')
const { analyze } = require('./analyze')
const { log } = require("./log")

let pages = new Set()
let RESTRICT = false
let IGNORED = ['/issues/','/pulls','/commits/']
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
					const content = code.text()
					const fileName = pageUrl.slice(0, pageUrl.length - 1).split("/").pop()
					const suffix = fileName.split(".").pop()
					const analytic = analyze(suffix, fileName, content)
					return saveCodeFile(pageUrl, fileName, content, analytic)
				}
				return Promise.resolve()
			}).then(() => {
				$('a').each((i, e) => {
					const href = formatUrl($(e).attr('href'))
					if (isValidUrl(href)) {
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

crawler.on("drain", () => {
	log("QUEUE EMPTY")
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

function isValidUrl(p) {
	if (!p || !p.startsWith(baseUrl)) return false
	for (let a of IGNORED) {
		if (p.includes(a)) return false
	}
	return true
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

function ignorePath(p) {
	IGNORED.push(p)
}

module.exports = { addPage, setRestrict, ignorePath }
