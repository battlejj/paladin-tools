/* NPM Dependencies */
var _ = require('lodash')
  , math = require('mathjs')
  , debug = require('debug')('Paladin');

/* Lib Includes */
var constants = require('./src/lib/constants.js')
  , utils = require('./src/lib/utils.js')
  , playerTemplate = require('./src/basePlayer.js')
  , abilities = require('./src/abilities/index');

/*
  Class: Paladin
  @player[object]: player object containing the bear minimum stats for the simulation.
  @duration[number]: how long to run the sim
  @inactiveSpec[boolean]: use secondary spec
 */
function Paladin(player, duration, inactiveSpec){
  duration = duration || 360;
  player = player || playerTemplate;
  var that = this;
  //The abilities available to our paladin. Will be altered by talents.
  this.abilities = {};
  //Track the current Seal as a property of the Paladin
  this.currentSeal = 'Seal of Truth';
  //TODO: Make # of enemies configurable, add AoE rotation in addition to single target
  this.enemies = 1;
  //Track Holy Power as a property of the Paladin
  this.holyPower = 0;
  this.damageStats = {};
  this.baseStats = {};
  this.baseStats.strength = this.baseStats.attackPower = this.baseStats.spellPower = player.stats.str;
  this.baseStats.critRating = player.stats.critRating;
  this.baseStats.masteryRating = player.stats.masteryRating;
  this.baseStats.hasteRating = player.stats.hasteRating;
  this.baseStats.multistrikeRating = player.stats.multistrikeRating || 0;
  this.baseStats.versatilityRating = player.stats.versatilityRating || 0;

  this.talents = inactiveSpec
    ? (player.talents[0].selected ? player.talents[1] : player.talents[0].talents)
    : (player.talents[0].selected ? player.talents[0] : player.talents[1].talents);

  this.configureDraenorPerks();
  this.configurePlayer(player);
  this.configureStats();
  this.configureTimeline(duration);

  for(var n in abilities){
    if(abilities.hasOwnProperty(n)){
      this.abilities[n] = new abilities[n](this);
    }
  }

  this.configureAbilities();

  _.defaults(player, playerTemplate);

}

Paladin.prototype.configureAbilities = function(){

  if(!_.where(this.talents, {'spell': {'name': 'Holy Avenger' } }).length){
    debug('Holy Avenger talent not found, removing ability');
    this.abilities.HolyAvenger.enabled = true;
  }

  if(!_.where(this.talents, {'spell': {'name': 'Sanctified Wrath' } }).length) {
    debug('Sanctified Wrath talent not found, will not modify Avenging Wrath');
  } else {
    debug('Found Sanctified Wrath, extend Avenging Wrath duration to 30 seconds');
    this.abilities.AvengingWrath.baseDuration = 30;
  }

  if(!_.where(this.talents, {'spell': {'name': 'Divine Purpose' } }).length){
    debug('Divine Purpose talent not found, removing ability');
    delete this.abilities.DivinePurpose;
  }

  if(!_.where(this.talents, {'spell': {'name': 'Holy Prism' } }).length){
    debug('Holy Prism talent not found, removing ability');
    delete this.abilities.HolyPrism;
  }

  if(_.where(this.talents, {'spell': {'name': 'Light\'s Hammer' } }).length){
    debug('Light\'s Hammer found, adding ability');
    this.abilities.LightsHammer.enabled = true;
  }

  if(_.where(this.talents, {'spell': {'name': 'Execution Sentence' } }).length){
    debug('Execution Sentence found, adding ability');
    this.abilities.ExecutionSentence.enabled = true;

    debug('Enabled: %s', this.abilities.ExecutionSentence.enabled);
  }

  if(!_.where(this.talents, {'spell': {'name': 'Empowered Seals' } }).length){
    debug('Empowered Seals talent not found, removing ability');
    delete this.abilities.EmpoweredSeals;
  }

  if(!_.where(this.talents, {'spell': {'name': 'Seraphim' } }).length){
    debug('Seraphim talent not found, removing ability');
    delete this.abilities.Seraphim;
  }

  if(!_.where(this.talents, {'spell': {'name': 'Final Verdict' } }).length){
    debug('Final Verdict talent not found, removing ability');
    this.abilities.FinalVerdict.enabled = false;
    this.abilities.TemplarsVerdict.enabled = true;
  } else {
    debug('Final Verdict talent found, removing Templar\'s Verdict');
    this.abilities.FinalVerdict.enabled = true;
    this.abilities.TemplarsVerdict.enabled = false;
  }
};

Paladin.prototype.configureStats = function(){
  var that = this;
  this.stats = {};
  for(var stat in this.baseStats){
    if(this.baseStats.hasOwnProperty(stat)){
      this.stats[stat] = this.baseStats[stat];
    }
  }

  this.weapon.realSpeed = function(){
    return that.weapon.speed/(1 + (that.stats.hastePercent/100));
  }
  this.weapon.nextSwing = this.weapon.realSpeed();

  this.raidBuffs();
};

Paladin.prototype.configurePlayer = function(player){
  var that = this;
  this.weapon = {};
  this.weapon.minDamage = player.items.mainHand.weaponInfo.damage.exactMin;
  this.weapon.maxDamage = player.items.mainHand.weaponInfo.damage.exactMax;
  this.weapon.speed = player.items.mainHand.weaponInfo.weaponSpeed;
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
  var baseMasteryPercent = constants.wod.baseStats.mastery;
  var gearMasteryRating = this.stats.masteryRating;
  var buffMasteryRating = 550;
  var attunedMasteryRating = (gearMasteryRating + buffMasteryRating) * 1.05;
  var additionalMasteryPercent = attunedMasteryRating/constants.wod.combatRatings[100].mastery;


  var totalMastery = baseMasteryPercent + additionalMasteryPercent;
  this.stats.masteryPercent = math.round(totalMastery, 2);
};

/*
 The only primary stat we care about for Ret Paladins is Strength. It will buff our attack power and as a result our
 spell power since our AP and SP are equal in WoD.
 */
Paladin.prototype.raidBuffStats = function(){
  //Increase our strength by 5%
  this.stats.strength = math.round(this.stats.strength * 1.05);

  //Update our Attack Power based on our new strength. In WoD STR is 1:1 with AP.
  this.stats.attackPower = this.stats.strength;
  this.stats.spellPower = this.stats.strength;
};

/*
Versatility buff is 3%
 */
Paladin.prototype.raidBuffVersatility = function(){
  //Increase our versatility by 3%
  this.stats.versatilityPercent = math.round((this.stats.versatilityRating/constants.wod.combatRatings[100].versatility) + 3, 2);
};

/*
 Multistrike buff is 5%
 */
Paladin.prototype.raidBuffMultistrike = function(){
  //Increase our multistrike by 5%
  this.stats.multistrikePercent = math.round((this.stats.multistrikeRating/constants.wod.combatRatings[100].multi) + 5, 2);
};

/*
 The only primary stat we care about for Ret Paladins is Strength. It will buff our attack power and as a result our
 spell power since our AP and SP are equal in WoD.
 */
Paladin.prototype.raidBuffAP = function(){
  //Increase attack power by 10%
  this.stats.attackPower = math.round(this.stats.strength * 1.10);
  this.stats.spellPower = this.stats.attackPower;
};

/*
 Crit raid buff is 5% crit increase and Ret Paladins have 5% base crit
 */
Paladin.prototype.raidBuffCrit = function(){
  this.stats.critPercent = math.round((this.stats.critRating/constants.wod.combatRatings[100].crit)
    + constants.wod.baseStats.crit + 5, 2);
};

/*
 Haste raid buff is 5% haste increase
 */
Paladin.prototype.raidBuffHaste = function(){
  this.stats.hastePercent = math.round((this.stats.hasteRating/constants.wod.combatRatings[100].haste) + 5, 2);
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
  //this.abilities.AutoAttack.cooldown = this.abilities.AutoAttack.cooldown - time;
  for(var n in this.abilities){
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
    this.damageStats[ability] = this.damageStats[ability] ? this.damageStats[ability] + damage : damage;

    this.damageStats[ability + ' Count'] = this.damageStats[ability + ' Count'] ? this.damageStats[ability + ' Count'] + 1 : 1;
    this.damageStats['total'] = this.damageStats['total'] ? this.damageStats['total'] + damage : damage;

    if(isCrit){
      this.damageStats['crit'] = this.damageStats['crit'] ? this.damageStats['crit'] + damage : damage;
      this.damageStats['critCount'] = this.damageStats['critCount'] ? this.damageStats['critCount'] + 1 : 1;
    }

    if(isMultistrike){
      this.damageStats['multi'] = this.damageStats['multi'] ? this.damageStats['multi'] + damage : damage;
      this.damageStats['multiCount'] = this.damageStats['multiCount'] ? this.damageStats['multiCount']+ 1 : 1;
    }
  }

  return this.timeline.log[this.timeline.log.length-1]
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
    //console.log(this.timeline.time, this.timeline.duration)
    return this.simulate();
  }
};

Paladin.prototype.start = function(duration, sims){
  this.damageStats = {};
  this.configureTimeline(duration || 360);
  this.configureStats();
  sims = sims || 1;
  /*var results = {}, res;
  for(var i = 0; i < sims; i++){
    res = this.simulate();
    for(var key in res){
      results[key] = results[key] ? (results[key] + res[key]) : res[key];
    }
  }

  //console.log(results);

  for(var key in results){
    results[key] = math.round(results[key]/sims, 1);
  }

  results.dps = math.round(results.total/duration, 1);
  return results;
  */
  var test = this.simulate();
  return test.total/duration;

}

Paladin.prototype.raidBuffs = function(){
  this.raidBuffCrit();
  this.raidBuffHaste();
  this.raidBuffMastery();
  this.raidBuffStats();
  this.raidBuffAP();
  this.raidBuffVersatility();
  this.raidBuffMultistrike();
};

Paladin.prototype.calculateWeaponSwing = function(){
  var damage
    , random
    , min = this.weapon.minDamage
    , max = this.weapon.maxDamage
    , ratio = constants.wod.attackPowerToDPS
    , speed = this.weapon.speed
    , attackPower = this.stats.attackPower
    ;

  //random = _.random(min, max, false);
  random = (min + max)/2;
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
    , attackPower = this.stats.attackPower
    ;

  //random = _.random(min, max, false);
  random = (min + max)/2;
  damage = random + (speed * attackPower / ratio) * 1.3;
  damage = math.round(damage);



  return damage;
};

var paladin = new Paladin();

paladin.start()

module.exports = Paladin;