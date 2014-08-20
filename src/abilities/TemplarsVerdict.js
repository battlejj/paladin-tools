var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function TemplarsVerdict(paladin){
  Ability.call(this, paladin);
  this.name = 'Templar\'s Verdict';
  this.enabled = true;
}

TemplarsVerdict.prototype = Object.create(Ability.prototype);
TemplarsVerdict.prototype.constructor = TemplarsVerdict;

TemplarsVerdict.prototype.attempt = function(){
  if(!this.enabled || this.isGCD() || this.paladin.holyPower < 3){
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
  this.spendHolyPower(3);
  this.multistrike(this.name, damage);
  this.sealOfTruth(damage, true);
  this.applyCensure();
  this.applyHandOfLight(damage);
  this.applyGlobalCooldown();
};

TemplarsVerdict.prototype.calculateDamage = function(){
  //A powerful weapon strike that deals 185% Physical damage.
  var base = this.versatility((this.paladin.calculateNormalizedWeaponSwing() * 1.85) * this.getModifier(this.name));

  return this.armorMitigation(base);
};

module.exports = TemplarsVerdict;
