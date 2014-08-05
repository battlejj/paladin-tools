var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function HolyAvenger(paladin){
  Ability.call(this, paladin);
  this.name = 'Holy Avenger';
  this.baseCooldown = 120;
  this.baseDuration = 18;
  this.cooldown = 0;
  this.duration = 0;
}

HolyAvenger.prototype = Object.create(Ability.prototype);
HolyAvenger.prototype.constructor = HolyAvenger;

HolyAvenger.prototype.attempt = function() {
  if (this.cooldown > 0) {
    return false;
  }
  this.cooldown = this.baseCooldown;
  this.duration = this.baseDuration;
  this.applyGlobalCooldown();
};

module.exports = HolyAvenger;