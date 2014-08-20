var probability = require('./probability.js');
var constants = require('./constants.js');
var math = require('mathjs');
var utils = {};

utils.isCrit = function(rating){
  var fixedRating = math.round(rating * 100, 2);
  return probability([true, false], [fixedRating, 100-fixedRating]);
};

utils.isMultistrike = function(rating){
  var fixedRating = math.round(rating * 100, 2);
  return probability([true, false], [fixedRating, 100-fixedRating]);
};

utils.resetExorcism = function(){
  return probability([true, false], [20, 80]);
};

utils.ratingToPercent = function(type, rating){
  return math.round(rating/constants.wod.combatRatings[100][type]/100, 4);
};

utils.percentToRating = function(type, percent){
  return math.round(percent * 100 * constants.wod.combatRatings[100][type]);
};

utils.percentToString = function(percentage){
  return math.round(percentage * 100, 2);
}

module.exports = utils;

