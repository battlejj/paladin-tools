var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function FinalVerdict(paladin){
  Ability.call(this, paladin);
  this.name = 'Final Verdict';
  this.enabled = false;
}

FinalVerdict.prototype = Object.create(Ability.prototype);
FinalVerdict.prototype.constructor = FinalVerdict;

FinalVerdict.prototype.attempt = function(){
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

FinalVerdict.prototype.calculateDamage = function(){
  //280% holy damage
  var base = this.versatility((this.paladin.calculateNormalizedWeaponSwing() * 2.8) * this.getModifier(this.name));

  return math.round(base);
};

module.exports = FinalVerdict;
