var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function FinalVerdict(paladin){
  Ability.call(this, paladin);
  this.name = 'Final Verdict';
}

FinalVerdict.prototype = Object.create(Ability.prototype);
FinalVerdict.prototype.constructor = FinalVerdict;

FinalVerdict.prototype.attempt = function(){
  if(!this.paladin.abilities.finalVerdict || this.isGCD() || this.paladin.holyPower < 3){
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, damage, crit ? damage * 2 : damage, crit, false);

  this.multistrike(this.name, damage);
  this.sealOfTruth(damage, true);
  this.applyCensure();
  this.spendHolyPower(3);
  this.applyHandOfLight(damage);
  this.applyGlobalCooldown();
};

FinalVerdict.prototype.calculateDamage = function(){
  //280% holy damage
  var base = (this.paladin.calculateWeaponSwing() * 2.8) * this.getModifier(this.name);

  return math.round(base);
};