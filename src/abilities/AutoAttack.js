var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function AutoAttack(paladin){
  Ability.call(this, paladin);
  this.name = 'Auto Attack';
  this.baseCooldown = this.paladin.weapon.speed;
  this.cooldown = this.paladin.weapon.realSpeed();
}

AutoAttack.prototype = Object.create(Ability.prototype);
AutoAttack.prototype.constructor = AutoAttack;

AutoAttack.prototype.attempt = function() {
  if (this.cooldown > 0) {
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.buffed.critPercent);
  this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
  this.cooldown = this.paladin.weapon.realSpeed();

  this.multistrike(this.name, damage);
  this.sealOfTruth(damage, true);
  this.applyCensure();

  if(utils.resetExorcism()){
    this.paladin.abilities.Exorcism.cooldown = 0;
  }
};

AutoAttack.prototype.calculateDamage = function(){
  var base = this.versatility(this.paladin.calculateWeaponSwing() * this.getModifier(this.name));

  return this.armorMitigation(base);
};

module.exports = AutoAttack;