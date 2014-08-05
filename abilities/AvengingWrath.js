var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function AvengingWrath(paladin){
  Ability.call(this, paladin);
  this.name = 'Avenging Wrath';
  this.baseCooldown = 180;
  this.baseDuration = this.paladin.abilities.avengingWrath.sanctified ? 30 : 20;
  this.cooldown = 0;
  this.duration = 0;
}

AvengingWrath.prototype = Object.create(Ability.prototype);
AvengingWrath.prototype.constructor = AvengingWrath;

AvengingWrath.prototype.attempt = function() {
  if (this.cooldown > 0) {
    return false;
  }
  this.cooldown = this.baseCooldown;
  this.duration = this.baseDuration;
  this.applyGlobalCooldown();
};

module.exports = AvengingWrath;