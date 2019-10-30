const { log } = require('./log')
const { storeRepo, addFileEntry } = require('./store')

async function saveRepoDetails(url, $) {
	const details = $('.repohead-details-container')
	if (!details.length) {
		return false
	}
	const author = details.find($('span.author')).text()
	const name = details.find($('strong[itemprop="name"]')).text()
	let stars
	details.find($('.social-count')).each((i, e) => {
		if ($(e).attr('aria-label').includes('starred')) {
			stars = Number.parseInt($(e).attr('aria-label').split(' ')[0])
		}
	})
	await storeRepo({ url, author, name, stars, files: [] })
	return true
}

async function saveCodeFile(url, type, content, analytics) {
	const repoUrl = new URL(url).origin + new URL(url).pathname.split('/').slice(0, 3).join('/') + '/'
	await addFileEntry(repoUrl, { url, type, content, analytics })
}

module.exports = { saveRepoDetails, saveCodeFile }
