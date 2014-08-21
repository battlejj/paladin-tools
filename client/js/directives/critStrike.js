var math = require('mathjs');

var critDirective = function(){
  return {
    scope: true,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/crit.html',
    link: function(scope, elem, attrs) {
      scope.baseCrit = 5;
      scope.error = false;

      scope.$watch('critRating', function(newVal, oldVal){
        updateCritPercent();
      });

      scope.$watch('buffs.crit', function(newVal, oldVal){
        updateCritPercent();
      });

      function updateCritPercent(){
        var val = scope.critRating;
        var buff = scope.hasBuff('crit') ? 5 : 0;

        var critPercent = math.round(scope.baseCrit + (scope.utils.ratingToPercent('crit', val) * 100) + buff, 2);
        scope.critPercent = isNaN(critPercent) ? scope.baseCrit + buff : critPercent;

        console.log(scope.critPercent);
        if(isNaN(scope.critRating)){
          scope.error = true;
        } else {
          scope.error = false;
        }
      }
    }
  };
}

module.exports = critDirective;