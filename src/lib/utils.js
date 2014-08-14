var probability = require('./probability.js');
var utils = {};

utils.isCrit = function(rating){
  return probability([true, false], [rating, 100-rating]);
};

utils.isMultistrike = function(rating){
  return probability([true, false], [rating, 100-rating]);
};

utils.resetExorcism = function(){
  return probability([true, false], [20, 80]);
}

module.exports = utils;