/* NPM Dependencies */
var _ = require('lodash')
  , math = require('mathjs')
  , debug = require('debug')('Paladin');

var Player = require('./Player.js');

/* Lib Includes */
var constants = require('./src/lib/constants.js')
  , utils = require('./src/lib/utils.js')
  , playerTemplate = require('./src/basePlayer.js')
  , abilities = require('./src/abilities/index');

/*
 Class: Paladin
 @player[object]: player object containing the bare minimum stats for the simulation.
 @duration[number]: how long to run the sim
 @inactiveSpec[boolean]: use secondary spec
 */
function Paladin(data, buffs){
  Player.apply(this, arguments);
  var that = this;
  this.abilities = {};
  this.currentSeal = 'Seal of Truth';
  //TODO: Make # of enemies configurable, add AoE rotation in addition to single target
  this.enemies = 1;
  this.holyPower = 0;
  this.damageStats = {abilities: {}, counts: {}, extras:{}};

  this.configureDraenorPerks();
  this.configureWeapon(data.weapon);
  this.resetTimeline();

  for(var n in abilities){
    if(abilities.hasOwnProperty(n)){
      this.abilities[n] = new abilities[n](this);
    }
  }

  this.configureAbilities();

}

Paladin.prototype = Object.create(Player.prototype);
Paladin.prototype.constructor = Paladin;

Paladin.prototype.configureAbilities = function(){
  console.log('TALENTS', this.talents)
  if(this.talents.indexOf('Holy Avenger') == -1){
    debug('Holy Avenger talent not found, removing ability');
    this.abilities.HolyAvenger.enabled = true;
  }

  if(this.talents.indexOf('Sanctified Wrath') == -1){
    debug('Sanctified Wrath talent not found, will not modify Avenging Wrath');
  } else {
    debug('Found Sanctified Wrath, extend Avenging Wrath duration to 30 seconds');
    this.abilities.AvengingWrath.baseDuration = 30;
  }

  if(this.talents.indexOf('Divine Purpose') == -1){
    debug('Divine Purpose talent not found, removing ability');
    this.abilities.DivinePurpose.enabled = false;
  }

  if(this.talents.indexOf('Holy Prism') == -1){
    debug('Holy Prism talent not found, removing ability');
    this.abilities.HolyPrism.enabled = false;
  }

  if(this.talents.indexOf('Light\'s Hammer') != -1){
    debug('Light\'s Hammer found, adding ability');
    this.abilities.LightsHammer.enabled = true;
  }

  if(this.talents.indexOf('Execution Sentence') != -1){
    debug('Execution Sentence found, adding ability');
    this.abilities.ExecutionSentence.enabled = true;
  }

  if(this.talents.indexOf('Empowered Seals') == -1){
    debug('Empowered Seals talent not found, removing ability');
    this.abilities.EmpoweredSeals.enabled = false;
  }

  if(this.talents.indexOf('Seraphim') == -1){
    debug('Seraphim talent not found, removing ability');
    this.abilities.Seraphim.enabled = false;
  }

  if(this.talents.indexOf('Final Verdict') == -1){
    debug('Final Verdict talent not found, removing ability');
    this.abilities.FinalVerdict.enabled = false;
    this.abilities.TemplarsVerdict.enabled = true;
  } else {
    debug('Final Verdict talent found, removing Templar\'s Verdict');
    this.abilities.FinalVerdict.enabled = true;
    this.abilities.TemplarsVerdict.enabled = false;
  }
};

Paladin.prototype.configureWeapon = function(weapon){
  var that = this;
  this.weapon = {};
  this.weapon.minDamage = weapon.damage.exactMin;
  this.weapon.maxDamage = weapon.damage.exactMax;
  this.weapon.speed = weapon.weaponSpeed;
  this.weapon.dps = weapon.dps;
  this.weapon.realSpeed = function(){
    return that.weapon.speed/(1 + that.stats.buffed.hastePercent);
  }
  this.weapon.nextSwing = this.weapon.realSpeed();
};

/*
 Draenor Perks for level 91+ Players: Empowered Hammer of Wrath, Empowered Seal of Truth, Improved Crusader Strike,
 Improved Exorcism, Improved Judgment
 */
Paladin.prototype.configureDraenorPerks = function(){
  this.perks = [];
  if(this.level > 90){
    this.perks[this.perks.length] = "Empowered Hammer of Wrath";
    this.perks[this.perks.length] = "Empowered Seal of Truth";
    this.perks[this.perks.length] = "Improved Crusader Strike";
    this.perks[this.perks.length] = "Improved Exorcism";
    this.perks[this.perks.length] = "Improved Judgment";
  }
};

Paladin.prototype.isExecuteRange = function(){
  if(this.hasPerk('Empowered Hammer of Wrath')){
    return this.timeline.time > (this.timeline.duration * .65);
  } else {
    return this.timeline.time > (this.timeline.duration * .80);
  }
};

Paladin.prototype.isAvengingWrathing = function(){
  return this.abilities.AvengingWrath.duration > 0;
};

Paladin.prototype.isHolyAvengering = function(){
  return this.abilities.HolyAvenger.enabled && this.abilities.HolyAvenger.duration > 0;
};

Paladin.prototype.hasPerk = function(perk){
  return this.perks.indexOf(perk) != -1;
};

Paladin.prototype.advanceTime = function(time){
  this.timeline.time = math.round(this.timeline.time + time, 3);
  this.timeline.gcd = math.round(this.timeline.gcd - time, 2);
  //this.abilities.AutoAttack.cooldown = this.abilities.AutoAttack.cooldown - time;
  for(var n in this.abilities){
    if(this.abilities.hasOwnProperty(n)){
      if(this.abilities[n].cooldown > 0){
        this.abilities[n].cooldown = math.round(this.abilities[n].cooldown - time, 2);
      } else {
        this.abilities[n].cooldown = 0;
      }

      if(this.abilities[n].duration && this.abilities[n].duration > 0){
        this.abilities[n].duration = math.round(this.abilities[n].duration - time, 2);
      } else if(this.abilities[n].duration) {
        this.abilities[n].duration = 0;
      }
    }
  }
};

Paladin.prototype.log = function(ability, damage, isCrit, isMultistrike, isBuff, isFade){
  this.timeline.log[this.timeline.log.length] = {
    ability: ability,
    damage: damage,
    time: this.timeline.time,
    multistrike: isMultistrike || false,
    crit: isCrit || false,
    holyPower: this.holyPower
  };

  if(damage !== 0){
    if(isNaN(damage)){
      console.log('PROBLEM WITH ABILITY RETURNING NAN: %s', ability)
    }
    this.damageStats.abilities[ability] = this.damageStats.abilities[ability] ? this.damageStats.abilities[ability] + damage : damage;

    this.damageStats.counts[ability] = this.damageStats.counts[ability] ? this.damageStats.counts[ability] + 1 : 1;
    this.damageStats['total'] = this.damageStats['total'] ? this.damageStats['total'] + damage : damage;

    if(isCrit){
      this.damageStats.extras['crit'] = this.damageStats.extras['crit'] ? this.damageStats.extras['crit'] + damage : damage;
      this.damageStats.extras['critCount'] = this.damageStats.extras['critCount'] ? this.damageStats.extras['critCount'] + 1 : 1;
    }

    if(isMultistrike){
      this.damageStats.extras['multi'] = this.damageStats.extras['multi'] ? this.damageStats.extras['multi'] + damage : damage;
      this.damageStats.extras['multiCount'] = this.damageStats.extras['multiCount'] ? this.damageStats.extras['multiCount']+ 1 : 1;
    }

  }

  return this.timeline.log[this.timeline.log.length-1];
};

Paladin.prototype.simulate = function(){
  this.abilities.Censure.tick();
  this.abilities.AutoAttack.attempt();
  this.abilities.ExecutionSentence.tick();
  this.abilities.LightsHammer.tick();

  if(this.timeline.gcd <= 0){
    this.abilities.AvengingWrath.attempt();
    this.abilities.HolyAvenger.attempt();
    this.abilities.ExecutionSentence.attempt();
    this.abilities.LightsHammer.attempt();

    if(this.holyPower === 5){
      this.abilities.FinalVerdict.attempt();
      this.abilities.TemplarsVerdict.attempt();
    }

    this.abilities.HammerOfWrath.attempt();
    this.abilities.CrusaderStrike.attempt();
    this.abilities.Judgment.attempt();
    this.abilities.Exorcism.attempt();
  }

  if(this.timeline.time >= this.timeline.duration){
    return this.damageStats;
  } else {
    this.advanceTime(.1);
    return this.simulate();
  }
};

Paladin.prototype.resetTimeline = function(){
  this.timeline = {};
  this.timeline.time = 0;
  this.timeline.gcd = 0;
  this.timeline.log = [];
  this.damageStats = {abilities: {}, counts: {}, extras:{}};

  for(var n in this.abilities) {
    if(this.abilities.hasOwnProperty(n)){
      this.abilities[n].resetCooldown();
      this.abilities[n].resetDuration();
    }
  }
}

Paladin.prototype.start = function(duration, sims){
  this.damageStats = {};
  this.resetTimeline();
  this.timeline.duration = duration || 360;
  sims = sims || 1;

  console.log('Run %s sims', sims)

  var results = {};
  for(var i = 0; i < sims; i++){
    var sim = this.simulate();
    for(var k in sim){
      if(sim.hasOwnProperty(k)){
        results[k] = results[k] ? (results[k] + sim[k]) : sim[k];
      }
    }
    console.log(sim)
    this.resetTimeline();
  }

  for(var l in results){
    if(results.hasOwnProperty(l)){
      results[l] = math.round(results[l]/sims, 2);
    }
  }

  return sim;
}

Paladin.prototype.calculateWeaponSwing = function(){
  var damage
    , random
    , min = this.weapon.minDamage
    , max = this.weapon.maxDamage
    , ratio = constants.wod.attackPowerToDPS
    , speed = this.weapon.speed
    , attackPower = this.stats.buffed.attackPower
    ;

  random = _.random(min, max, false);
  damage = random + (speed * attackPower / ratio) * 1.3;
  damage = math.round(damage);
  return damage;
};

Paladin.prototype.calculateNormalizedWeaponSwing = function(){
  var damage
    , random
    , min = this.weapon.minDamage
    , max = this.weapon.maxDamage
    , ratio = constants.wod.attackPowerToDPS
    , speed = 3.3
    , attackPower = this.stats.buffed.attackPower
    ;

  random = _.random(min, max, false);
  damage = random + (speed * attackPower / ratio) * 1.3;
  damage = math.round(damage);

  return damage;
};

module.exports = Paladin;