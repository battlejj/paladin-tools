var _ = require('lodash')
  , math = require('mathjs');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function Censure(paladin){
  Ability.call(this, paladin);
  this.name = 'Censure';
  this.baseCooldown = 3;
  this.cooldown = 0;
  this.duration = 15;
  this.lastApplied = 0;
  this.lastTick = 0;
  this.stacks = 0;
}

Censure.prototype = Object.create(Ability.prototype);
Censure.prototype.constructor = Censure;

Censure.prototype.tick = function(){
  var time = this.paladin.timeline.time;
  //If we haven't had a censure application in the last 15 seconds, drop off the censure stacks
  if(time - this.lastApplied > this.duration){
    this.stacks = 0;
  }

  //If there is actually a censure stack on the mob, determine if it's time to do a tick of damage
  if(this.stacks > 0
    && ((time - this.lastTick >= this.baseCooldown) || time === this.lastApplied)){
    var damage = this.calculateDamage();
    var crit = utils.isCrit(this.paladin.stats.critPercent);
    this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
    /*
     Currently assuming censure cannot multistrike. If it can uncomment out the following line:
     this.multistrike(ability, damage);
     */
    this.lastTick = time;
  }
};

Censure.prototype.calculateDamage = function(){
  return math.round(((this.paladin.stats.spellPower * .05148) * this.stacks) * this.getModifier(this.name));
};

Censure.prototype.applyCensure = function(){
  if(this.paladin.currentSeal === 'Seal of Truth'){
    if(this.stacks < 5){
      this.stacks = this.stacks + 1;
    } else {
      this.stacks = 5;
    }

    this.lastApplied = this.paladin.timeline.time;

    //This is our first censure application, so tick immediately
    if(this.stacks === 1){
      this.tick();
    }
  }
};

module.exports = Censure;