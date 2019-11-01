angular.module('searcherApp').component('repoDetails', {
	templateUrl: 'repo-list/repo-details.html',
	controller: function RepoDetailsController() {
		const _this = this
		this.$onInit = () => {
			_this.author = _this.repo.author
			_this.name = _this.repo.name
			_this.files = _this.repo.files
			_this.totalFiles = _this.files.length
			let lines = 0
			for (let f of _this.files) {
				if (f.analytic) lines += f.analytic.linesOfCode
			}
			_this.totalLinesOfCode = lines
			console.log("loaded details")
		}
	},
	bindings: {
		repo: '<'
	}
})
