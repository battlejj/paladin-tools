var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function Exorcism(paladin){
  Ability.call(this, paladin);
  this.name = 'Exorcism';
  this.baseCooldown = 15;
  this.cooldown = 0;
  this.duration = 0;
}

Exorcism.prototype = Object.create(Ability.prototype);
Exorcism.prototype.constructor = Exorcism;

Exorcism.prototype.attempt = function(){
  if(this.cooldown > 0 || this.isGCD()){
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
  this.cooldown = this.baseCooldown;

  this.multistrike(this.name, damage);
  this.applyCensure();
  this.gainHolyPower();
  this.applyGlobalCooldown();
};

Exorcism.prototype.calculateDamage = function(){
  var base = (this.paladin.stats.attackPower * 1.171)
  * this.getModifier(this.name);

  return math.round(base);
};

module.exports = Exorcism;
