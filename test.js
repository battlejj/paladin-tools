/* NPM Modules */
var _ = require('lodash')
  , math = require('mathjs')
  , debug = require('debug')('Paladin');

/* Lib Includes */
var constants = require('./lib/constants.js')
  , utils = require('./lib/utils.js')
  , player = require('./player.js')
  , abilities = require('./abilities/index');

//TODO: Update player.js with values from Beta Player sheet
function Paladin(player, duration, inactiveSpec){
  var that = this;
  var talents = inactiveSpec
    ? (player.talents[0].selected ? player.talents[1] : player.talents[0].talents)
    : (player.talents[0].selected ? player.talents[0] : player.talents[1].talents);
  this.configureAbilities(talents);
  this.configureDraenorPerks();
  this.configureStats(player);
  this.configureTimeline(duration);
  this.raidBuffs();
  this.name = player.name;
  this.holyPower = 0;
  this.currentSeal = 'Seal of Truth';
  this.enemies = 1;
  this.a = {};
  for(var n in abilities){
    this.a[n] = new abilities[n](this);
  }
}

Paladin.prototype.calculateWeaponSwing = function(){
  var randomSwingDamage = Math.round(_.random(this.weapon.minDamage, this.weapon.maxDamage));

  return (randomSwingDamage
    + ((this.stats.attackPower/constants.wod.attackPowerToDPS) * this.weapon.speed))
    * 1.3;
};

Paladin.prototype.calculateNormalizedWeaponSwing = function(){
  var randomSwingDamage = Math.round(_.random(this.weapon.minDamage, this.weapon.maxDamage));

  return (randomSwingDamage
    + ((this.stats.attackPower/constants.wod.attackPowerToDPS) * constants.wod.normalized2H))
    * 1.3;
};

Paladin.prototype.configureStats = function(player){
  var that = this;
  this.level = player.level;
  this.stats = {};
  this.stats.strength = player.stats.str;
  this.stats.attackPower = this.stats.strength;
  this.stats.spellPower = this.stats.strength;
  this.stats.critRating = player.stats.critRating;
  this.stats.masteryRating = player.stats.masteryRating;
  this.stats.hasteRating = player.stats.hasteRating;
  this.stats.multistrikeRating = player.stats.multistrikeRating || 0;
  this.stats.multistrikePercent = this.stats.multistrikeRating/constants.wod.combatRatings[100].multi;
  this.stats.versatilityRating = player.stats.versatilityRating || 0;

  this.weapon = {};
  this.weapon.minDamage = player.items.mainHand.weaponInfo.damage.exactMin;
  this.weapon.maxDamage = player.items.mainHand.weaponInfo.damage.exactMax;
  this.weapon.speed = player.items.mainHand.weaponInfo.weaponSpeed;
  this.weapon.realSpeed = function(){
    return that.weapon.speed/(1 + (that.stats.hastePercent/100));
  }
  this.weapon.nextSwing = this.weapon.realSpeed();
  this.weapon.dps = player.items.mainHand.weaponInfo.dps;
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

/*
  Mastery Attunement for Ret Paladins is fun to calculate...
  Mastery raid buff is 550 mastery rating
 */
Paladin.prototype.raidBuffMastery = function(){
  var baseMastery = constants.wod.baseStats.mastery;
  var gearMastery = this.stats.masteryRating/constants.wod.combatRatings[100].mastery;
  var buffMastery = 550/constants.wod.combatRatings[100].mastery;

  var totalMastery = baseMastery + gearMastery + buffMastery;
  var percent = totalMastery/100;

  this.stats.masteryPercent = percent;
};

/*
  The only primary stat we care about for Ret Paladins is Strength. It will buff our attack power and as a result our
  spell power since our AP and SP are equal in WoD.
 */
Paladin.prototype.raidBuffStats = function(){
  //Increase our strength by 5%
  this.stats.strength = this.stats.strength * (this.stats.str * .05);

  //Update our Attack Power based on our new strength. In WoD STR is 1:1 with AP.
  this.stats.attackPower = player.stats.str;
  this.stats.spellPower = player.stats.str;
};

/*
  Crit raid buff is 5% crit increase and Ret Paladins have 5% base crit
 */
Paladin.prototype.raidBuffCrit = function(){
  this.stats.critPercent = (this.stats.critRating/constants.wod.combatRatings[100].crit)
  + constants.wod.baseStats.crit + 5;
};

/*
  Haste raid buff is 5% haste increase
 */
Paladin.prototype.raidBuffHaste = function(){
  this.stats.hastePercent = (this.stats.hasteRating/constants.wod.combatRatings[100].haste) + 5;
};

Paladin.prototype.isExecuteRange = function(){
  if(this.hasPerk('Empowered Hammer of Wrath')){
    return this.timeline.time > (this.timeline.duration * .65);
  } else {
    return this.timeline.time > (this.timeline.duration * .80);
  }
};

Paladin.prototype.isAvengingWrathing = function(){
  return this.a.AvengingWrath.duration > 0;
};

Paladin.prototype.isHolyAvengering = function(){
  return this.a.HolyAvenger && this.a.HolyAvenger.duration > 0;
};

Paladin.prototype.hasPerk = function(perk){
  return this.perks.indexOf(perk) != -1;
};

Paladin.prototype.configureAbilities = function(talents){

  var abilities = {
    avengingWrath: {dur: 20, cd: 180, remaining_dur: 0, remaining_cd: 0},
    crusaderStrike: {dur: 0, cd: 4.5, remaining_dur: 0, remaining_cd: 0},
    divinePurpose: {dur: 0, cd: 0, remaining_dur: 0, remaining_cd: 0},
    executionSentence: {dur: 10, cd: 60, remaining_dur: 0, remaining_cd: 0},
    exorcism: {dur: 0, cd: 15, remaining_dur: 0, remaining_cd: 0},
    empoweredSeals: {dur: 20, cd: 0, remaining_dur: 0, remaining_cd: 0},
    finalVerdict: {dur: 0, cd: 0, remaining_dur: 0, remaining_cd: 0},
    hammerOfWrath: {dur: 0, cd: 0, remaining_dur: 0, remaining_cd: 0},
    holyAvenger: {dur: 18, cd: 120, remaining_dur: 0, remaining_cd: 0},
    holyPrism: {dur: 0, cd: 20, remaining_dur: 0, remaining_cd: 0},
    judgment: {dur: 0, cd: 6, remaining_dur: 0, remaining_cd: 0},
    lightsHammer: {dur: 14, cd: 60, remaining_dur: 0, remaining_cd: 0},
    seraphim: {dur: 15, cd: 30, remaining_dur: 0, remaining_cd: 0},
    templarsVerdict: {dur: 0, cd: 0, remaining_dur: 0, remaining_cd: 0}
  };

  if(!_.where(talents, {'spell': {'name': 'Holy Avenger' } }).length){
    debug('Holy Avenger talent not found, removing ability');
    delete abilities.holyAvenger;
  }

  if(!_.where(talents, {'spell': {'name': 'Sanctified Wrath' } }).length) {
    debug('Sanctified Wrath talent not found, will not modify Avenging Wrath');
  } else {
    debug('Found Sanctified Wrath, modifying Avenging Wrath');
    abilities.avengingWrath.sanctified = true;
    abilities.avengingWrath.dur *= 1.5;
  }

  if(!_.where(talents, {'spell': {'name': 'Divine Purpose' } }).length){
    debug('Divine Purpose talent not found, removing ability');
    delete abilities.divinePurpose;
  }

  if(!_.where(talents, {'spell': {'name': 'Holy Prism' } }).length){
    debug('Holy Prism talent not found, removing ability');
    delete abilities.holyPrism;
  }

  if(!_.where(talents, {'spell': {'name': 'Light\'s Hammer' } }).length){
    debug('Light\'s Hammer talent not found, removing ability');
    delete abilities.lightsHammer;
  }

  if(!_.where(talents, {'spell': {'name': 'Execution Sentence' } }).length){
    debug('Execution Sentence talent not found, removing ability');
    delete abilities.executionSentence;
  }

  if(!_.where(talents, {'spell': {'name': 'Empowered Seals' } }).length){
    debug('Empowered Seals talent not found, removing ability');
    delete abilities.empoweredSeals;
  }

  if(!_.where(talents, {'spell': {'name': 'Seraphim' } }).length){
    debug('Seraphim talent not found, removing ability');
    delete abilities.seraphim;
  }

   if(!_.where(talents, {'spell': {'name': 'Final Verdict' } }).length){
     debug('Final Verdict talent not found, removing ability');
     delete abilities.finalVerdict;
   } else {
     debug('Final Verdict talent found, removing Templar\'s Verdict');
     delete abilities.templarsVerdict;
   }

   this.abilities = abilities;
};


Paladin.prototype.configureTimeline = function(duration){
  this.timeline = {};
  this.timeline.duration = duration;
  this.timeline.log = [];
  this.timeline.time = 0;
  this.timeline.gcd = 0;
};

Paladin.prototype.advanceTime = function(time){
  this.timeline.time = math.round(this.timeline.time + time, 3);
  this.timeline.gcd = math.round(this.timeline.gcd - time, 2);
  //this.a.AutoAttack.cooldown = this.a.AutoAttack.cooldown - time;
  for(var n in this.a){
    if(this.a[n].cooldown > 0){
      this.a[n].cooldown = math.round(this.a[n].cooldown - time, 2);
    } else {
      this.a[n].cooldown = 0;
    }

    if(this.a[n].duration && this.a[n].duration > 0){
      this.a[n].duration = math.round(this.a[n].duration - time, 2);
    } else if(this.a[n].duration) {
      this.a[n].duration = 0;
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

  return this.timeline.log[this.timeline.log.length-1]
};

Paladin.prototype.startSim = function(){
  this.a.Censure.tick();
  this.a.AutoAttack.attempt();
  this.a.ExecutionSentence.tick();
  this.a.LightsHammer.tick();

  //console.log('gcd exterior', this.timeline.gcd)

  if(this.timeline.gcd <= 0){
    this.a.AvengingWrath.attempt();
    this.a.HolyAvenger.attempt();
    this.a.ExecutionSentence.attempt();
    this.a.LightsHammer.attempt();

    if(this.holyPower === 5){
      this.a.FinalVerdict.attempt();
      this.a.TemplarsVerdict.attempt();
    }

    this.a.HammerOfWrath.attempt();
    this.a.CrusaderStrike.attempt();
    this.a.Judgment.attempt();
    this.a.Exorcism.attempt();
  }
  if(this.timeline.time >= this.timeline.duration){
    //console.log('sim over');
    return math.round(this.calculateSimDPS());
  } else {
    this.advanceTime(.1);
    return this.startSim();
  }
};

Paladin.prototype.calculateSimDPS = function(){
  var totalDamage = this.timeline.log.reduce(function(a, b){
    return { damage: a.damage + b.damage };
  });
  //console.log(this.timeline.log)
  var fs = require('fs');
  fs.writeFileSync('./output.json', JSON.stringify(this.timeline.log))
  debug('%s damage done', totalDamage.damage);
  //console.log('%s damage done', totalDamage.damage);
  debug('%s dps - %s over %s', totalDamage.damage/this.timeline.duration, totalDamage.damage, this.timeline.duration);
  //console.log('%s dps - %s over %s', totalDamage.damage/this.timeline.duration, totalDamage.damage, this.timeline.duration);
  return totalDamage.damage/this.timeline.duration;
};

Paladin.prototype.raidBuffs = function(){
  this.raidBuffCrit();
  this.raidBuffHaste();
  this.raidBuffMastery();
  this.raidBuffStats();
}


var results = [];
var sims = 1;
for(var i = 0; i < sims; i++){
  var p = new Paladin(player, 360);
  results[i] = p.startSim();
}

var total = results.reduce(function(a, b){
 return a + b;
})

var avg = total/sims;
console.log(avg);
