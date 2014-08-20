var math = require('mathjs');

var hasteDirective = function(){
  return {
    scope: true,
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
        scope.hastePercent = math.round((scope.utils.ratingToPercent('haste', val) * 100) + buff, 2);
      }
    }
  };
}

module.exports = hasteDirective;