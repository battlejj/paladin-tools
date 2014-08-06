var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function CrusaderStrike(paladin){
  Ability.call(this, paladin);
  this.name = 'Crusader Strike';
  this.baseCooldown = 4.5;
  this.cooldown = 0;
  this.duration = 0;
}

CrusaderStrike.prototype = Object.create(Ability.prototype);
CrusaderStrike.prototype.constructor = CrusaderStrike;

CrusaderStrike.prototype.attempt = function(){
  if(this.cooldown > 0 || this.isGCD()){
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
  this.cooldown = this.getHastedCooldown();

  this.multistrike(this.name, damage);
  this.sealOfTruth(damage, true);
  this.applyCensure();
  this.gainHolyPower();
  this.applyHandOfLight(damage);
  this.applyHastedGlobalCooldown();
};

CrusaderStrike.prototype.calculateDamage = function(){
  var base = this.paladin.calculateNormalizedWeaponSwing() * this.getModifier(this.name);

  return this.armorMitigation(base);
};

module.exports = CrusaderStrike;