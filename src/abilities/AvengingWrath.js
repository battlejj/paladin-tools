var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function AvengingWrath(paladin){
  Ability.call(this, paladin);
  this.name = 'Avenging Wrath';
  this.baseCooldown = 180;
  this.baseDuration = 20;
  this.cooldown = 0;
  this.duration = 0;
}

AvengingWrath.prototype = Object.create(Ability.prototype);
AvengingWrath.prototype.constructor = AvengingWrath;

AvengingWrath.prototype.attempt = function() {
  if (this.cooldown > 0
    || this.isGCD()) {
    return false;
  }

  this.paladin.log(this.name, 0, false, false);
  this.cooldown = this.baseCooldown;
  this.duration = this.baseDuration;
  this.applyGlobalCooldown();
};

module.exports = AvengingWrath;