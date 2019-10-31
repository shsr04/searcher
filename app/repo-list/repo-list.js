angular.module('searcherApp').component('repoList', {
	templateUrl: 'repo-list/repo-list.html',
	controller: ['$http', '$timeout', function RepoListController($http, $timeout) {
		const _this = this
		this.ready = false
		let _repoBuf
		$http.post('http://localhost:8020/unlock', 'testkey').then(() => {
			return $http.get('http://localhost:8020/repos')
		}).then(res => {
			_repoBuf = res.data.data
			return protobuf.load("lib/transfer/repository.proto")
		}).then(root => {
			const RepositoryList = root.lookupType("searcher.RepositoryList")
			_this.repos = RepositoryList.decode(_repoBuf).repos
		}).catch(e => { throw e })
	}]
})
