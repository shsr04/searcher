const fs = require("fs")
const path = require("path")
const { log } = require("./log")

const REPO_JSON = path.join(__dirname, "..", "store", "repos.json")
const CODEFILES_JSON = path.join(__dirname, "..", "store", "code-files.json")

let repos = new Map()
let codeFiles = new Map()

function saveRepoDetails(url, $, details) {
	const author = details.find($('span.author')).text()
	const repo = details.find($('strong[itemprop="name"]')).text()
	let stars
	details.find($('.social-count')).each((i, e) => {
		if ($(e).attr('aria-label').includes('starred')) {
			stars = $(e).attr('aria-label').split(' ')[0]
		}
	})
	if (!repos.has(url)) {
		repos.set(url, { url, author, repo, stars })
		//log(`added repo ${author} ${repo} ${stars}`)
	}
}

function mapToObjects(map) {
	let r = []
	for (let v of map.values()) {
		r.push(v)
	}
	return r
}

function getRepos(fake) {
	if (fake) return getFakeRepos()
	return mapToObjects(repos)
}

function getFakeRepos() {
	return [
		{ author: "root", repo: "testing", stars: "99" },
		{ author: "root", repo: "high-integrity", stars: "340" }
	]
}

function getCodeFiles() {
	return mapToObjects(codeFiles)
}

function saveCodeFile(url, type, body, analytics) {
	if (!codeFiles.has(url)) {
		codeFiles.set(url, { url, type, body, analytics })
		log(`added ${type} file: ${url}`)
	}
}

function writeMapsToDisk() {
	fs.writeFileSync(REPO_JSON, JSON.stringify(getRepos()))
	fs.writeFileSync(CODEFILES_JSON, JSON.stringify(getCodeFiles()))
}

module.exports = { saveRepoDetails, getRepos, saveCodeFile, writeMapsToDisk }
