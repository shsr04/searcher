angular.module('repoList', [])

angular.module('repoList').component('repoList', {
    templateUrl: 'repo-list/repo-list.html',
    controller: ['$scope', '$http', function RepoListController($scope, $http) {
        const _this = this
        $http.post("http://localhost:8020/unlock", "testkey").then(res => {
            return $http.get('http://localhost:8020/repos')
        }).then(res => {
            console.log("repos", res.data)
            _this.repos = res.data
        }).catch(e => { })
    }]
})
