const { log } = require('./log')
const { storeRepo, addFileEntry, fileType } = require('./store')

async function saveRepoDetails(url, $) {
	const repoUrl = new URL(url).origin + new URL(url).pathname.split("/").slice(0, 3).join("/") + "/"
	const details = $('.repohead-details-container')
	if (!details.length) {
		return
	}
	const author = details.find($('span.author')).text()
	const name = details.find($('strong[itemprop="name"]')).text()
	let stars
	details.find($('.social-count')).each((i, e) => {
		if ($(e).attr('aria-label').includes('starred')) {
			stars = Number.parseInt($(e).attr('aria-label').split(' ')[0])
		}
	})
	await storeRepo({ url: repoUrl, author, name, stars })
}

async function saveCodeFile(url, name, content, analytic) {
	const repoUrl = new URL(url).origin + new URL(url).pathname.split('/').slice(0, 3).join('/') + '/'
	const type = fileType(name.split(".").pop())
	log(`adding ${type} file: ${url}`)
	await addFileEntry(repoUrl, { url, name, type, content: '', analytic })
}

module.exports = { saveRepoDetails, saveCodeFile }
