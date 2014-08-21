var math = require('mathjs');

var multistrikeDirective = function(){
  return {
    scope: true,
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

        scope.multistrikePercent = isNaN(multistrikePercent) ? buff : multistrikePercent;

        if(isNaN(scope.multistrikeRating)){
          scope.error = true;
        } else {
          scope.error = false;
        }
      }
    }
  };
}

module.exports = multistrikeDirective;