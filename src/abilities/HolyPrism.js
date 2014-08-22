var _ = require('lodash');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function HolyPrism(paladin){
  Ability.call(this, paladin);
  this.name = 'Holy Prism';
  this.baseCooldown = 0;
  this.baseDuration = 0;
  this.cooldown = 0;
  this.duration = 0;
  this.enabled = false;
}
HolyPrism.prototype = Object.create(Ability.prototype);
HolyPrism.prototype.constructor = HolyPrism;

module.exports = HolyPrism;