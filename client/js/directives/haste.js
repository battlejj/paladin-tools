var math = require('mathjs');

var hasteDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/haste.html',
    link: function(scope, elem, attrs) {
      scope.$watch('hasteRating', function(newVal, oldVal){
        updateHastePercent();
      });

      scope.$watch('buffs.haste', function(newVal, oldVal){
        updateHastePercent();
      });

      function updateHastePercent(){
        var val = scope.hasteRating;
        var buff = scope.hasBuff('haste') ? 5 : 0;
        var hastePercent = math.round((scope.utils.ratingToPercent('haste', val) * 100) + buff, 2);

        scope.hastePercent = isNaN(hastePercent) || scope.hasteRating < 0 ? buff : hastePercent;

        if(isNaN(scope.hasteRating) || scope.hasteRating < 0){
          scope.hasteError = true;
        } else {
          scope.hasteError = false;
        }
      }
    }
  };
}

module.exports = hasteDirective;