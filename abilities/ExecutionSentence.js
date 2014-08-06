var _ = require('lodash');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function ExecutionSentence(paladin){
  Ability.call(this, paladin);
  this.name = 'Execution Sentence';
  this.baseCooldown = 60;
  this.baseDuration = 10;
  this.cooldown = 0;
  this.duration = 0;
  this.lastTick = 0;
  this.tickCount = 0;
}
ExecutionSentence.prototype = Object.create(Ability.prototype);
ExecutionSentence.prototype.constructor = ExecutionSentence;

ExecutionSentence.prototype.tick = function(){
  var damage
    , crit;
  if(this.paladin.abilities
  && this.paladin.abilities.executionSentence
  && this.tickCount > 0
  && (this.paladin.timeline.time - this.lastTick >= 1)){
    damage = this.calculateDamage();
    crit = utils.isCrit(this.paladin.stats.critPercent);
    this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
    this.multistrike(this.name, damage);
    this.lastTick = this.paladin.timeline.time;
    this.tickCount = this.tickCount - 1;
  }
};

ExecutionSentence.prototype.calculateDamage = function(){
  var base = this.paladin.stats.spellPower * 9142/1000;

  //The amount of damage done depends on what tick we are currently on
  return Math.round(base
    * constants.wod.executionSentenceTicks[this.tickCount -1]/100 * this.getModifier(this.name));
};

ExecutionSentence.prototype.attempt = function(){

  if(!this.paladin.abilities.executionSentence
    || this.cooldown > 0
    || this.isGCD()){
      return false;
  }
  this.tickCount = 10;
  this.cooldown = this.baseCooldown;
  this.tick();
  this.applyGlobalCooldown();
};

module.exports = ExecutionSentence;