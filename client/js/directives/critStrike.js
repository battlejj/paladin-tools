var math = require('mathjs');

var critDirective = function(){
  return {
    scope: true,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/crit.html',
    link: function(scope, elem, attrs) {
      scope.baseCrit = 5;

      scope.$watch('critRating', function(newVal, oldVal){
        updateCritPercent();
      });

      scope.$watch('buffs.crit', function(newVal, oldVal){
        updateCritPercent();
      });

      function updateCritPercent(){
        var val = scope.critRating;
        var buff = scope.hasBuff('crit') ? 5 : 0;
        scope.critPercent = math.round(scope.baseCrit + (scope.utils.ratingToPercent('crit', val) * 100) + buff, 2);
      }
    }
  };
}

module.exports = critDirective;