const protobuf = require('protobufjs')
const path = require('path')
const fs = require('fs')

const REPOSITORY_PROTO = path.join(__dirname, '..', 'transfer', 'repository.proto')
const REPOSITORY_STORE = path.join(__dirname, '..', 'store', 'repoList.pb')

let RepositoryList
let Repository
let File
let FileType

let repoList

/**
 * Store an object containing repo data.
 * @param {searcher.Repository} p instance of a searcher.Repository message 
 */
async function storeRepo(p) {
	let err = Repository.verify(p)
	if (err) throw err
	for (let a of repoList.repos) {
		if (a.author === p.author && a.repo === p.repo) {
			return false
		}
	}
	repoList.repos.push(p)
	return true
}

/**
 * Add a file entry to a repo.
 * @param {string} repoUrl repo URL to search for
 * @param {searcher.File} file searcher.File message to append to files
 */
async function addFileEntry(repoUrl, file) {
	let err = File.verify(file)
	if (err) throw err
	for (let a of repoList.repos) {
		if (a.url === repoUrl) {
			a.files.push(file)
			return true
		}
	}
	return false
}

/**
 * Get the proper FileType for the file.
 * @param {string} suffix file suffix
 * @returns {searcher.FileType | undefined} FileType variant, if any
 */
function fileType(suffix) {
	if (['c', 'h', 'cc', 'cpp', 'hpp'].includes(suffix)) {
		return FileType.values.C_CPP
	}
	return undefined
}

function allRepos() {
	return RepositoryList.encode(repoList).finish()
}

async function initStorage() {
	const root = await protobuf.load(REPOSITORY_PROTO)
	RepositoryList = root.lookupType('searcher.RepositoryList')
	Repository = root.lookupType('searcher.Repository')
	File = root.lookupType('searcher.File')
	FileType = root.lookupEnum('searcher.File.FileType')
	if (fs.existsSync(REPOSITORY_STORE)) {
		const buffer = fs.readFileSync(REPOSITORY_STORE)
		const list = RepositoryList.decode(buffer)
		repoList = list.toJSON()
	} else {
		const emptyList = { repos: [] }
		const err = RepositoryList.verify(emptyList)
		if (err) throw err
		repoList = RepositoryList.create(emptyList)
	}
}

function writeToDisk() {
	const wire = RepositoryList.encode(repoList).finish()
	fs.writeFileSync(REPOSITORY_STORE, wire)
}

module.exports = { initStorage, writeToDisk, storeRepo, allRepos, addFileEntry, fileType }
