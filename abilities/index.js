var _ = require('lodash');
var AutoAttack = require('./AutoAttack')
  , Censure = require('./Censure')
  , CrusaderStrike = require('./CrusaderStrike')
  , ExecutionSentence = require('./ExecutionSentence');

var abilities = {
  AutoAttack: AutoAttack
  , Censure: Censure
  , CrusaderStrike: CrusaderStrike
  , ExecutionSentence: ExecutionSentence
};

module.exports = abilities;