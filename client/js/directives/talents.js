var talentsDirective = function(){
  return {
    scope: false,
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'views/talents.html',
    link: function(scope, elem, attrs) {
      scope.talents75 = [
        {
          name: 'Holy Avenger'
          , short: 'HolyAvenger'
          , image: ''
        }
        , {
          name: 'Sanctified Wrath'
          , short: 'SanctifiedWrath'
          , image: ''
        }
        , {
          name: 'Divine Purpose'
          , short: 'DivinePurpose'
          , image: ''
        }];

        scope.talents90 = [{
          name: 'Holy Prism'
          , short: 'HolyPrism'
          , image: ''
        }
        , {
          name: 'Light\'s Hammer'
          , short: 'LightsHammer'
          , image: ''
        }
        , {
          name: 'Execution Sentence'
          , short: 'ExecutionSentence'
          , image: ''
        }];

        scope.talents100 = [{
          name: 'Empowered Seals'
          , short: 'EmpoweredSeals'
          , image: ''
        }
        , {
          name: 'Seraphim'
          , short: 'Seraphim'
          , image: ''
        }
        , {
          name: 'Final Verdict'
          , short: 'FinalVerdict'
          , image: ''
        }];

    }
  };
}

module.exports = talentsDirective;
