'use strict';
var angular = require('angular');
var constants = require('../../src/lib/constants.js')
var ret = require('./paladin-factory');
angular.module('wt.paladin', [])
  .factory('ret', ret);

  angular.module('wt', ['wt.paladin', 'highcharts-ng'])
  .controller('home', function($scope, ret){
    $scope.sims = 50;
    $scope.duration = 360;
    $scope.pally = new ret.Paladin();
    $scope.constants = constants;
    $scope.damage = 0;
    git

    $scope.updateChartData = function(){
      var abilityData = [];
      var categories = [];
      for(var k in $scope.damage){
        if($scope.damage.hasOwnProperty(k)
          && k != 'total'
          && k.indexOf('Count') == -1
          && k.indexOf('multi') == -1
          && k.indexOf('crit') == -1){
          categories.push(k);
          console.log($scope.damage[k], '/', $scope.damage.total, '=', $scope.damage[k]/$scope.damage.total * 100)
          abilityData.push({name: k + ' - ' + Math.round($scope.damage[k]/$scope.damage.total * 100) + '%', y: $scope.damage[k]});
        }
      }
      $scope.chartConfig.series = [{data: abilityData}];
    }

    $scope.sim = function(){
      $scope.damage = $scope.pally.start($scope.duration, $scope.sims);
      console.log($scope.damage);
      $scope.updateChartData();
    }

    $scope.getDPS = function(){
      console.log($scope.pally.damageStats.total/360, 'dps');
      console.log($scope.pally.stats.critRating);
    }

  });