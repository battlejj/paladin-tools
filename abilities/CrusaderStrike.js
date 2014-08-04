var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function CrusaderStrike(paladin){
  Ability.call(this, paladin);
  this.name = 'Crusader Strike';
  this.baseCooldown = 4.5;
  this.baseDuration = 0;
  this.cooldown = 0;
  this.duration = 0;
}

CrusaderStrike.prototype = Object.create(Ability.prototype);
CrusaderStrike.prototype.constructor = CrusaderStrike;

CrusaderStrike.prototype.attempt = function(){
  if(this.cooldown > 0 || this.isGCD()){
    return false;
  }

  this.cooldown = this.getHastedCooldown();
  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, damage, crit ? damage * 2 : damage, crit, false);
  this.multistrike(this.name, damage);
  this.applyCensure();
  this.gainHolyPower();
  this.applyHandOfLight(damage);
  this.applyHastedGlobalCooldown();
};

CrusaderStrike.prototype.calculateDamage = function(){
  var base = this.paladin.calculateWeaponSwing() * this.getModifier('Crusader Strike');

  //The amount of damage done depends on what tick we are currently on
  return this.armorMitigation(base
    * this.getModifier('Crusader Strike'));
};