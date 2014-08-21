var math = require('mathjs');

var multistrikeDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/multistrike.html',
    link: function(scope, elem, attrs) {
      scope.$watch('multistrikeRating', function(newVal, oldVal){
        updateMultistrikePercent();
      });

      scope.$watch('buffs.multistrike', function(newVal, oldVal){
        updateMultistrikePercent();
      });

      function updateMultistrikePercent(){
        var val = scope.multistrikeRating;
        var buff = scope.hasBuff('multistrike') ? 5 : 0;
        var multistrikePercent = math.round((scope.utils.ratingToPercent('multistrike', val) * 100) + buff, 2);

        scope.multistrikePercent = isNaN(multistrikePercent) || scope.multistrikeRating < 0 ? buff : multistrikePercent;

        if(isNaN(scope.multistrikeRating) || scope.multistrikeRating < 0){
          scope.multistrikeError = true;
        } else {
          scope.multistrikeError = false;
        }
      }
    }
  };
}

module.exports = multistrikeDirective;