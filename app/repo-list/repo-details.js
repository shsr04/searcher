angular.module('searcherApp').component('repoDetails', {
	templateUrl: 'repo-list/repo-details.html',
	controller: function RepoDetailsController() {
		const _this = this
		this.$onInit = () => {
			_this.author = _this.repo.author
			_this.name = _this.repo.name
			_this.files = _this.repo.files
		}
	},
	bindings: {
		repo: '<',
		totalFiles: '<',
	}
})
