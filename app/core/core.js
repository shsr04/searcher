angular.module('core', [])

angular.module('core').directive('afterDelay', ['$timeout', ($timeout) => {
    return {
        restrict: 'A',
        /**
         * Usage `<div after-delay="x"> ... </div>`
         * Executes the action `x` when the browser is done computing the element.
         * For example, in combination with `ng-repeat`, `x` is delayed until the repeat is done.
         * How it works: $timeout puts the given function into the event "bucket".
         *  Our function is delayed until the previous functions in the bucket are done.
         */
        link: (scope, elem, attr) => {
            if (attr.afterDelay) {
                $timeout(() => {
                    scope.$eval(attr.afterDelay)
                })
            }
        }
    }
}])
