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


angular.module('wt.paladin', [])
  .factory('ret', ret)
  .directive('wtTalents', talents)
  .directive('wtBuffs', buffs)
  .directive('wtCrit', crit)
  .directive('wtHaste', haste)
  .directive('wtMastery', mastery)

  angular.module('wt', ['wt.paladin',  'ui.bootstrap'])
  .controller('home', function($scope, ret){
    $scope.buffs = {};
    $scope.talents = {};
    $scope.utils = utils;
    $scope.critRating = 0;
    $scope.hasteRating = 0;
    $scope.masteryRating = 0;

    $scope.getBuffs = function(){
      var buffsArray = [];
      for(var k in $scope.buffs){
        if($scope.buffs.hasOwnProperty(k) && $scope.buffs[k]){
          buffsArray[buffsArray.length] = k;
        }
      }
      return buffsArray;
    };

    $scope.hasBuff = function(name){
      if($scope.getBuffs().indexOf(name) != -1){
        return true;
      }

      return false;
    }

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

      console.log(talentsArray);
      return talentsArray;
    };

  });