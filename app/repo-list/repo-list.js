angular.module('searcherApp').component('repoList', {
	templateUrl: 'repo-list/repo-list.html',
	controller: ['$http', function RepoListController($http) {
		const _this = this
		let _repoBuf
		this.$onInit = () => {
			$http.post('http://localhost:8020/unlock', 'testkey').then(() => {
				return $http.get('http://localhost:8020/repos')
			}).then(res => {
				_repoBuf = res.data.data
				return protobuf.load("lib/transfer/repository.proto")
			}).then(root => {
				const RepositoryList = root.lookupType("searcher.RepositoryList")
				_this.repos = RepositoryList.decode(_repoBuf).repos
				console.log('repos', _this.repos)
			}).catch(e => { throw e })
		}
	}]
})
