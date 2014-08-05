var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function AutoAttack(paladin){
  Ability.call(this, paladin);
  this.name = 'Auto Attack';
  this.baseCooldown = paladin.weapon.speed;
  this.cooldown = paladin.weapon.realSpeed();
}

AutoAttack.prototype = Object.create(Ability.prototype);
AutoAttack.prototype.constructor = AutoAttack;

AutoAttack.prototype.attempt = function() {
  if (this.cooldown > 0) {
    return false;
  }

  var damage = this.calculateDamage();
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  this.paladin.log(this.name, damage, crit ? damage * 2 : damage, crit, false);
  this.cooldown = this.getHastedCooldown();

  this.multistrike(this.name, damage);
  this.applyCensure();
};

AutoAttack.prototype.calculateDamage = function(){
  var base = this.paladin.calculateWeaponSwing() * this.getModifier(this.name);

  //The amount of damage done depends on what tick we are currently on
  return this.armorMitigation(base);
};

module.exports = AutoAttack;