var math = require('mathjs');

var masteryDirective = function(){
  return {
    scope: true,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/mastery.html',
    link: function(scope, elem, attrs) {
      scope.baseMastery = 14.8;

      scope.$watch('masteryRating', function(newVal, oldVal){
        updateMasteryPercent();
      });

      scope.$watch('buffs.mastery', function(newVal, oldVal){
        updateMasteryPercent();
      });

      function updateMasteryPercent(){
        var val = scope.masteryRating;
        var buff = scope.hasBuff('mastery') ? 550 : 0;
        var combinedRating = val + buff;

        var masteryPercent = math.round(scope.baseMastery + (scope.utils.ratingToPercent('mastery', val + buff) * 100), 2);

        scope.masteryPercent = isNaN(masteryPercent) ? math.round(scope.baseMastery + (scope.utils.ratingToPercent('mastery', buff) * 100), 2) : masteryPercent;

        if(isNaN(scope.masteryRating)){
          scope.error = true;
        } else {
          scope.error = false;
        }

      }
    }
  };
}

module.exports = masteryDirective;