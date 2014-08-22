var _ = require('lodash');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function EmpoweredSeals(paladin){
  Ability.call(this, paladin);
  this.name = 'Empowered Seals';
  this.baseCooldown = 0;
  this.baseDuration = 0;
  this.cooldown = 0;
  this.duration = 0;
  this.enabled = false;
}
EmpoweredSeals.prototype = Object.create(Ability.prototype);
EmpoweredSeals.prototype.constructor = EmpoweredSeals;

module.exports = EmpoweredSeals;