var math = require('mathjs');

var strengthDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/strength.html',
    link: function(scope, elem, attrs) {
      scope.baseStrength = 1533;

      scope.$watch('strength', function(newVal, oldVal){
        updateBuffedStrength();
      });

      scope.$watch('buffs.stats', function(newVal, oldVal){
        updateBuffedStrength();
      });

      function updateBuffedStrength(){
        var buff, buffedStrength, val;

        val = scope.strength;
        if(isNaN(val) || val < scope.baseStrength) {
          scope.strengthError = true;
          buff = scope.hasBuff('stats') ? scope.baseStrength * .05 : 0;
          buffedStrength = math.round(scope.baseStrength + buff);
        } else {
          scope.strengthError = false;
          buff = scope.hasBuff('stats') ? (scope.strength * .05) : 0;
          buffedStrength = math.round(val + buff);
        }

        scope.buffedStrength = buffedStrength;

      }
    }
  };
}

module.exports = strengthDirective;