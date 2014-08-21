var math = require('mathjs');

var strengthDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/attackPower.html',
    link: function(scope, elem, attrs) {
      scope.baseAttackPower = 1533;

      scope.$watch('attackPower', function(newVal, oldVal){
        scope.updateBuffedAttackPower();
      });

      scope.$watch('buffedStrength', function(newVal, oldVal){
        scope.attackPower = scope.buffedStrength;
        scope.updateBuffedAttackPower();
      });

      scope.$watch('buffs.attackPower', function(newVal, oldVal){
        scope.updateBuffedAttackPower();
      });

      scope.updateBuffedAttackPower = function(){
        var buff, buffedAttackPower, val;

        val = scope.attackPower;

        if(isNaN(val) || val < scope.baseAttackPower) {
          scope.attackPowerError = true;
          buff = scope.hasBuff('attackPower') ? scope.baseAttackPower * .1 : 0;
          buffedAttackPower = math.round(scope.baseAttackPower + buff);
        } else {
          scope.attackPowerError = false;
          buff = scope.hasBuff('attackPower') ? (scope.attackPower * .1) : 0;
          buffedAttackPower = math.round(val + buff);
        }

        scope.buffedAttackPower = buffedAttackPower;
      }
    }
  };
}

module.exports = strengthDirective;