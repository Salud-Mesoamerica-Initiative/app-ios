angular.module('app.directives', [])

/* .directive('blankDirective', [function(){

}]); */

.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
				
                _element[0].focus();
				
            }, 1000);
        }
    };
});
