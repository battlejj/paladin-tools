var math = require('mathjs');

var constants = require('../lib/constants')
  , utils = require('../lib/utils');

function Ability(paladin, censure){
  this.paladin = paladin;
  this.baseCooldown = 0;
  this.cooldown = 0;
  this.duration = 0;

  this.censure = censure;

  this.perkModifiers = ['Crusader Strike', 'Censure', 'Exorcism', 'Judgment'];
  this.holyAvengerModifiers = ['Crusader Strike', 'Exorcism', 'Judgment'];
  this.sealOfTruthAbilities = ['Auto Attack', 'Crusader Strike', 'Judgment', 'Templar\'s Verdict'];
}

Ability.prototype.getModifier = function(ability){
  var modifier = 1;


  if(this.paladin.isAvengingWrathing()){
    modifier = modifier + .2;
  }

  if(this.perkModifiers.indexOf(ability) != -1){
    modifier = modifier + .2;
  }

  if(this.paladin.isHolyAvengering() && this.holyAvengerModifiers.indexOf(ability) != -1){
    modifier = modifier + .3;
  }

  //TODO: Make sunder armor part of a Raid buffs deal, hard coding it's debuff in for now
  this.paladin.sunderArmor = true;
  if(this.paladin.sunderArmor){
    modifier = modifier + .05;
  }

  return modifier;
};

Ability.prototype.armorMitigation = function(damage){
  return Math.round(damage * (1-.3493));
};

Ability.prototype.getHastedCooldown = function(){
  return math.round(this.baseCooldown/(1 + this.paladin.hastePercent), 2);
};

Ability.prototype.applyHastedGlobalCooldown = function(){
  var hasteModifier = 1 + this.paladin.hastePercent/100;
  var cooldown = math.round(this.getGlobalCooldown() / hasteModifier, 2);
  this.paladin.timeline.gcd = cooldown > 1
    ? cooldown
    : 1;
};

Ability.prototype.isGCD = function(){
  return this.paladin.timeline.gcd > 0;
};

Ability.prototype.getGlobalCooldown = function(){
  return constants.wod.globalCooldown;
};

/*
  Multistrike gives an ability two chances to do 30% of the original abilities damage.
  Each individual multistrike can crit.
  TODO: Confirm what damage types can multistrike and whether each individual strike has independent crit chance or
  TODO: if when the first strike crits they both crit
 */
Ability.prototype.multistrike = function(ability, damage){
  //reduce the potential damage to 30%
  damage = Math.round(damage * .3);
  var crit;

  //You get two independent chances to multistrike, each can independently crit
  //Log the multistrike as damage caused by the original ability. We can map reduce to determine what % of
  //Damage was caused by multistrike by using the multi field int he logs after the sim.
  if(utils.isMultistrike(this.paladin.stats.multistrike)){
    crit = utils.isCrit(this.paladin.stats.crit);
    this.paladin.log(ability, crit ? damage * 2 : damage, crit, true);
  }
  if(utils.isMultistrike(this.paladin.stats.multistrike)){
    crit = utils.isCrit(this.paladin.stats.crit);
    this.paladin.log(ability, crit ? damage * 2 : damage, crit, true);
  }
};

Ability.prototype.applyGlobalCooldown = function(){
  this.paladin.timeline.gcd = this.getGlobalCooldown();
};

Ability.prototype.applyCensure = function(){
  this.paladin.Censure.applyCensure();
};

Ability.prototype.applyHandOfLight = function(damage){
  var ability = 'Hand of Light';
  var crit = utils.isCrit(this.paladin.stats.critPercent);
  damage = Math.round(damage * (this.paladin.stats.masteryPercent/100));

  this.paladin.log(ability, damage, crit ? damage * 2 : damage, crit, false);
  //TODO: Check if Hand of Light can actually proc multistrike, assuming it can't right now
  //this.multistrike(damage, ability);

  return damage;
};


Ability.prototype.gainHolyPower = function(){
  var total;
  if(this.paladin.isHolyAvengering()){
    total = this.paladin.holyPower + 3;
  } else {
    total = this.paladin.holyPower + 1
  }

  if(total <= 5){
    this.paladin.holyPower = total;
  } else {
    this.paladin.holyPower = 5;
  }
};

Ability.prototype.sealOfTruth = function(damage, wasMitigated){
  //TODO: is seal of truth damage 12% of the unmitigated damage done by and attack or 12% of the post mitigation damage
  //this makes a huge difference in seal of truth damage and testing seems to suggest it's pre-mitigation damage since its
  //all holy damage
  damage = wasMitigated ? damage / (1 - .3493) : damage;
  damage = math.round(damage * .15);
  this.paladin.log('Seal of Truth', damage, false, false);
}

Ability.prototype.spendHolyPower = function(hp){
  var total = this.paladin.holyPower - hp;

  if(total >= 0){
    this.paladin.holyPower = total;
  } else {
    throw new Error('Spent more holy power than was available. Check your code.');
    this.paladin.holyPower = 0;
  }
};

module.exports = Ability;