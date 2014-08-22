var _ = require('lodash');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function DivinePurpose(paladin){
  Ability.call(this, paladin);
  this.name = 'Divine Purpose';
  this.baseCooldown = 0;
  this.baseDuration = 0;
  this.cooldown = 0;
  this.duration = 0;
  this.enabled = false;
}
DivinePurpose.prototype = Object.create(Ability.prototype);
DivinePurpose.prototype.constructor = DivinePurpose;

module.exports = DivinePurpose;