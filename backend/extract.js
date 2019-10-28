let repos = new Map()

function extractInfo($) {
	const details = $('.repohead-details-container')
	if (details.length) {
		const author = details.find($('span.author')).text()
		const repo = details.find($('strong[itemprop="name"]')).text()
		let stars
		details.find($('.social-count')).each((i, e) => {
			if ($(e).attr('aria-label').includes('starred')) {
				stars = $(e).attr('aria-label').split(' ')[0]
			}
		})
		if (!repos.has(`${author} ${repo}`)) {
			repos.set(`${author} ${repo}`, {
				author,
				repo,
				stars
			})
			console.log(author, repo, stars)
		}
	}
}

function getRepos() {
	repos.set('root testing', { author: 'root', repo: 'testing', stars: 99 })
	let r = []
	for (let v of repos.values()) {
		r.push(v)
	}
	console.log("sending ",r)
	return r
}

module.exports = { extractInfo, getRepos }
