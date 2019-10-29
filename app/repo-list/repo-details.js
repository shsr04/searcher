angular.module("searcherApp").component("repoDetails", {
    templateUrl: "repo-list/repo-details.html",
    controller: function RepoDetailsController() {
        this.lines = 100
    },
    bindings: {
        author: "<",
        repo: "<"
    }
})
