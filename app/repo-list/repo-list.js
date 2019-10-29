angular.module('searcherApp').component('repoList', {
    templateUrl: 'repo-list/repo-list.html',
    controller: ['$http', function RepoListController($http) {
        const _this = this
        $http.post("http://localhost:8020/unlock", "testkey").then(() => {
            return $http.get('http://localhost:8020/repos')
        }).then(res => {
            console.log("repos", res.data)
            _this.repos = res.data
        }).catch(e => { })
    }]
})
