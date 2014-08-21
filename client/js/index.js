'use strict';
var angular = require('angular');
var constants = require('../../src/lib/constants.js');
var utils = require('../../src/lib/utils.js');
var ret = require('./paladin-factory');
//var talents = require('./paladin-talents');
var buffs = require('./directives/buffs');
var talents = require('./directives/talents');
var crit = require('./directives/critStrike');
var haste = require('./directives/haste');
var mastery = require('./directives/mastery');
var multistrike = require('./directives/multistrike');
var versatility = require('./directives/versatility');
var strength = require('./directives/strength');
var attackPower = require('./directives/attackPower');


angular.module('wt.paladin', [])
  .factory('ret', ret)
  .directive('wtTalents', talents)
  .directive('wtBuffs', buffs)
  .directive('wtCrit', crit)
  .directive('wtHaste', haste)
  .directive('wtMastery', mastery)
  .directive('wtMultistrike', multistrike)
  .directive('wtVersatility', versatility)
  .directive('wtAttackPower', attackPower)
  .directive('wtStrength', strength)

angular.module('wt', ['wt.paladin',  'ui.bootstrap', 'ui.utils'])
  .controller('home', function($scope, ret){
    $scope.buffs = {};
    $scope.talents = {};
    $scope.ratingToPercent = utils.ratingToPercent;
    $scope.utils = utils;
    $scope.critRating = 0;
    $scope.hasteRating = 0;
    $scope.masteryRating = 0;
    $scope.multistrikeRating = 0;
    $scope.versatilityRating = 0;
    $scope.strength = 1533;
    $scope.attackPower = 1533;
    var fullBuffs = {'crit':true, 'haste':true, 'mastery':true, 'stats':true, 'attackPower':true, 'spellPower':true, 'versatility':true, 'multistrike':true};

    $scope.getBuffs = function(){
      var buffsArray = [];
      for(var k in $scope.buffs){
        if($scope.buffs.hasOwnProperty(k) && $scope.buffs[k]){
          buffsArray[buffsArray.length] = k;
        }
      }
      return buffsArray;
    };

    $scope.raidBuff = function(){
      console.log('raid buffed', $scope.buffs);
      $scope.buffs = fullBuffs;
    }

    $scope.noBuff = function(){
      console.log('no buffs', $scope.buffs);
      $scope.buffs = {};
    }

    $scope.hasBuff = function(name){
      if($scope.getBuffs().indexOf(name) != -1){
        return true;
      }

      return false;
    }

    $scope.resetStats = function(){
      $scope.critRating = $scope.masteryRating = $scope.hasteRating = $scope.multistrikeRating = $scope.versatilityRating = 0;
      $scope.strength = 1533;
    }

    $scope.$watch('strength', function(newVal, oldVal){
      console.log('set AP of %s to str of %s', $scope.attackPower, $scope.strength);
      $scope.attackPower = $scope.strength;
    });

    $scope.getTalents = function(){
      var talentsArray = [];

      if($scope.talents['75']){
        talentsArray[talentsArray.length] = $scope.talents['75'];
      }

      if($scope.talents['90']){
        talentsArray[talentsArray.length] = $scope.talents['90'];
      }

      if($scope.talents['100']){
        talentsArray[talentsArray.length] = $scope.talents['100'];
      }

      return talentsArray;
    };

  });