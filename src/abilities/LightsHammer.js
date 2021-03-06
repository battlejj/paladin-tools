var _ = require('lodash');

var Ability = require('./Ability')
  , constants = require('../lib/constants')
  , utils = require('../lib/utils');

function LightsHammer(paladin){
  Ability.call(this, paladin);
  this.name = 'Light\'s Hammer';
  this.baseCooldown = 60;
  this.cooldown = 0;
  this.duration = 0;
  this.lastTick = 0;
  this.tickCount = 0;
  this.enabled = false;
}
LightsHammer.prototype = Object.create(Ability.prototype);
LightsHammer.prototype.constructor = LightsHammer;

LightsHammer.prototype.tick = function(){
  var damage
    , crit;
  if(this.enabled
    && this.tickCount > 0
    && (this.paladin.timeline.time - this.lastTick >= 2)){
    damage = this.calculateDamage();
    crit = utils.isCrit(this.paladin.stats.critPercent);
    this.paladin.log(this.name, crit ? damage * 2 : damage, crit, false);
    this.multistrike(this.name, damage);
    this.lastTick = this.paladin.timeline.time;
    this.tickCount = this.tickCount - 1;
  }
};

LightsHammer.prototype.calculateDamage = function(){
  var base = this.paladin.stats.spellPower * .51678 * this.paladin.enemies;

  return Math.round(this.versatility(base * this.getModifier(this.name)));
};

LightsHammer.prototype.attempt = function(){
  if(!this.enabled
    || this.cooldown > 0
    || this.isGCD()){
    return false;
  }

  /*
  This setup allows for us to not have our first tick for 2 seconds
   */
  this.tickCount = 7;
  this.lastTick = this.paladin.timeline.time;
  this.cooldown = this.baseCooldown;
  this.applyGlobalCooldown();
};

module.exports = LightsHammer;