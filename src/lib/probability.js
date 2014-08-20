var _ = require('lodash');

module.exports = function(choices, weights){
  //This will be our deck of possibilities
  var choice, deck, i, idx, weight, _i, _j, _len;
  deck = [];
  //We need to make sure both our arguments are arrays, and they have equal # of elements
  //otherwise throw an error
  if(Array.isArray(choices) && Array.isArray(choices) && (choices.length === weights.length)){
    for (idx = _i = 0, _len = weights.length; _i < _len; idx = ++_i) {
      weight = weights[idx];
      weight = Math.round(weight);
      for (i = _j = 0; 0 <= weight ? _j <= weight : _j >= weight; i = 0 <= weight ? ++_j : --_j) {
        deck.push(idx);
      }
    }
    deck = _.shuffle(deck);
    choice = deck[Math.floor(Math.random() * deck.length)];
    return choices[choice];
  } else {
    throw 'Error when calling weighted_probability. Expected 2 arrays of equal length as arguments. Received: ' + JSON.stringify(arguments);
  }
}