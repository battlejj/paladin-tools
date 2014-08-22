var _ = require('lodash');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function Seraphim(paladin){
  Ability.call(this, paladin);
  this.name = 'Seraphim';
  this.baseCooldown = 0;
  this.baseDuration = 0;
  this.cooldown = 0;
  this.duration = 0;
  this.enabled = false;
}
Seraphim.prototype = Object.create(Ability.prototype);
Seraphim.prototype.constructor = Seraphim;

module.exports = Seraphim;