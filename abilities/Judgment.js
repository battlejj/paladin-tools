var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function Judgment(paladin){
  Ability.call(this, paladin);
  this.name = 'Judgment';
  this.baseCooldown = 6;
  this.cooldown = 0;
  this.duration = 0;
}

Judgment.prototype = Object.create(Ability.prototype);
Judgment.prototype.constructor = Judgment;

Judgment.prototype.attempt = function(){
  if(this.cooldown > 0 || this.isGCD()){
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, damage, crit ? damage * 2 : damage, crit, false);
  this.cooldown = this.getHastedCooldown();

  this.multistrike(this.name, damage);
  this.sealOfTruth(damage, true);
  this.applyCensure();
  this.gainHolyPower();
  this.applyHandOfLight(damage);
  this.applyHastedGlobalCooldown();
};

Judgment.prototype.calculateDamage = function(){
  var base = (this.paladin.stats.spellPower * .5021)
  * (this.paladin.stats.attackPower * .6031)
  * this.getModifier(this.name);

  return math.round(base);
};

module.exports = Judgment;
