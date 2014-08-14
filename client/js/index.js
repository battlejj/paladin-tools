'use strict';
var angular = require('angular');
var constants = require('../../src/lib/constants.js')
var ret = require('./paladin-factory');
angular.module('wt.paladin', [])
  .factory('ret', ret);

  angular.module('wt', ['wt.paladin'])
  .controller('home', function($scope, ret){
    $scope.pally = new ret.Paladin();
    $scope.constants = constants;
    $scope.damage = 0;
    $scope.sim = function(){
      $scope.damage = $scope.pally.start(360, 1);
      console.log($scope.damage)
    }

    $scope.getDPS = function(){
      console.log($scope.pally.damageStats.total/360, 'dps');
      console.log($scope.pally.stats.critRating);
    }

  });