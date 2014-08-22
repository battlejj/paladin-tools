var math = require('mathjs');

var versatilityDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/versatility.html',
    link: function(scope, elem, attrs) {
      scope.$watch('versatilityRating', function(newVal, oldVal){
        updateVersatilityPercent();
      });

      scope.$watch('buffs.versatility', function(newVal, oldVal){
        updateVersatilityPercent();
      });

      function updateVersatilityPercent(){
        var val = scope.versatilityRating;
        var buff = scope.hasBuff('versatility') ? 3 : 0;
        var versatilityPercent = math.round((scope.utils.ratingToPercent('versatility', val) * 100) + buff, 2);

        scope.versatilityPercent = isNaN(versatilityPercent) || scope.versatilityRating < 0 ? buff : versatilityPercent;

        if(isNaN(scope.versatilityRating) || scope.versatilityRating < 0){
          scope.versatilityError = true;
        } else {
          scope.versatilityError = false;
        }
      }
    }
  };
}

module.exports = versatilityDirective;