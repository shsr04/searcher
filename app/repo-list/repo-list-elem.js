angular.module("repoList").component("repoListElem", {
    templateUrl: "repo-list/repo-list-elem.html",
    controller: function RepoListElemController() {
        this.$onInit = () => {}
    },
    bindings: {
        bindRepo: "<"
    }
})
