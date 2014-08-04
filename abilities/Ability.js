var math = require('mathjs');

var constants = require('../lib/constants')
  , utils = require('../lib/utils');

function Ability(paladin){
  this.paladin = paladin;
  this.baseCooldown = 0;
  this.baseDuration = 0;
  this.cooldown = 0;
  this.duration = 0;

  this.censure = { stacks: 0, lastApplied: 0 };

  this.perkModifiers = ['Crusader Strike', 'Judgment', 'Exorcism', 'Censure'];
  this.holyAvengerModifiers = ['Crusader Strike', 'Judgment', 'Exorcism'];
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
  this.paladin.timeline.gcd = math.round(this.getGlobalCooldown()/(1 + this.paladin.hastePercent), 2);
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
}

Ability.prototype.applyGlobalCooldown = function(){
  this.paladin.timeline.gcd = this.getGlobalCooldown();
};

Ability.prototype.applyCensure = function(){
  if(this.paladin.currentSeal === 'Seal of Truth'){
    if(this.censure.stacks < 5){
      this.censure.stacks = this.censure.stacks + 1;
      this.censure.lastApplied = this.paladin.timeline.time;
    } else {
      this.censure.stacks = 5;
      this.censure.lastApplied = this.paladin.timeline.time;
    }

    //This is our first censure application, so tick immediately
    if(this.censure.stacks === 1){
      this.censureTick()
    }
  }
}

Ability.prototype.censureTick = function(){
  //If we haven't had a censure application in the last 15 seconds, drop off the censure stacks
  if(this.paladin.timeline.time - this.censure.lastApplied > 15){
    this.censure.stacks = 0;
  }

  var time = this.paladin.timeline.time;

  if(this.censure.stacks > 0
  && ((time - this.censure.lastTick >= 3) || time === this.censure.lastApplied)){
    var ability = 'Censure';
    var damage = Math.round(((this.paladin.stats.spellPower * .05148) * this.censure.stacks) * this.getModifier(ability));
    var crit = utils.isCrit(this.paladin.stats.critPercent);
    this.paladin.log(ability, crit ? damage * 2: damage, crit, false);

    /*
    Currently assuming censure cannot multistrike. If it can uncomment out the following line:
    this.multistrike(ability, damage);
     */
    this.censure.lastTick = time;
  }
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

module.exports = Ability;