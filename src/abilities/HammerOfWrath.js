var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function HammerOfWrath(paladin){
  Ability.call(this, paladin);
  this.name = 'Hammer of Wrath';
  this.baseCooldown = 6;
  this.cooldown = 0;
}

HammerOfWrath.prototype = Object.create(Ability.prototype);
HammerOfWrath.prototype.constructor = HammerOfWrath;

HammerOfWrath.prototype.attempt = function(){
  if(this.cooldown > 0 || this.isGCD() || !(this.paladin.isExecuteRange() || this.paladin.isAvengingWrathing())){
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.buffed.critPercent);
  this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
  this.cooldown = this.paladin.isAvengingWrathing() ? this.getHastedCooldown()/2 : this.getHastedCooldown();

  this.multistrike(this.name, damage);
  this.applyCensure();
  this.gainHolyPower();
  this.applyHandOfLight(damage);
  this.applyHastedGlobalCooldown();
};

HammerOfWrath.prototype.calculateDamage = function(){
  var base = this.versatility((this.paladin.stats.buffed.spellPower * 2.112)
    * this.getModifier(this.name));

  return math.round(base);
};

module.exports = HammerOfWrath;
