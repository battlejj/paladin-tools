var buffDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/buffs.html',
    link: function(scope, elem, attrs) {
      scope.buffList = [
        {
          name: 'Multistrike'
          ,short: 'multistrike'
        }
        , {
          name: 'Crit Strike'
          , short: 'crit'
        }
        , {
          name: 'Haste'
          , short: 'haste'
        }, {
          name: 'Mastery'
          , short: 'mastery'
        }
        , {
          name: 'Stats'
          , short: 'stats'
        }
        , {
          name: 'Attack Power'
          , short: 'attackPower'
        }
        , {
          name: 'Spell Power'
          , short: 'spellPower'
        }
        , {
          name: 'Versatility'
          , short: 'versatility'
        }];
    }
  };
}

module.exports = buffDirective;
