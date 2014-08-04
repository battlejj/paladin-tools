var _ = require('lodash')
  , math = require('mathjs')
  , debug = require('debug')('Paladin')
  , constants = require('./lib/constants.js')
  , utils = require('./lib/utils.js')
  , player = require('./player.js');


function Paladin(player, simDuration, raidBuffs, inactiveSpec, mopMode){
  var stats = player.stats
    , talents = inactiveSpec
      ? (player.talents[0].selected ? player.talents[1] : player.talents[0].talents)
      : (player.talents[0].selected ? player.talents[0] : player.talents[1].talents);

  var abilities = determineAbilities(talents);
  var no_gcd_abilities = {
    autoAttack: {
      weaponSpeed: (player.stats.mainHandSpeed * (1 + player.stats.haste)),
      cooldownRemaining: player.stats.mainHandSpeed
    },
    censure: {cooldown: 3, stacks: 0, lastTick: 0, lastApplied: 0},
    executionSentence: { tickCount: 0, lastTick: 0},
    lightsHammer: { tickCount: 0, lastTick: 0 }
  }
  var currentSeal = 'Truth';
  var combatLog = [];
  var combatTime = 0;
  var gcd = 1.5;
  var gcdRemaining = 0;

  var combatDuration = simDuration || 120;
  var buffs = {
    avengingWrath: false,
    holyAvenger: false,
    sunderArmor: true,
    seraphim: false,
    empoweredSealsTruth: false,
    empoweredSealsRighteous: false,
    improvedCrusaderStrike: true,
    improvedJudgment: true,
    improvedExorcism: true,
    empoweredHammerOfWrath: true
  };
  var holyPower = 0;
  statSquish();
  raidBuffs = raidBuffs || [];
  setRaidBuffs(raidBuffs);

  function sim() {
    if (combatTime >= combatDuration) {
      debug('Sim completed for %s seconds.', combatDuration);
      //debug('Crit', _.where(combatLog, {crit: true}))
      //debug('Multi', _.where(combatLog, {multistrike: true}))
      //debug(player.stats.crit)
      debug(JSON.stringify(combatLog))
      results();
      //debug(player.stats)
      return;
    }

    autoAttack();
    censureTick();
    executionSentenceTick();

    if(gcdRemaining <= 0){
      avengingWrath();
      holyAvenger();
      executionSentence();
      if(holyPower === 5) {
        finalVerdict();
        templarsVerdict();
      }

      crusaderStrike();
      judgement();
      exorcism();

      finalVerdict();
      templarsVerdict();
    }


    advanceTime(.1);

    return sim();
  }

  function results(){
    var totalDamge = combatLog.reduce(function(a, b){
      return {damage: a.damage + b.damage};
    })

    debug('%s damage done', totalDamge.damage);
    debug('%s dps - %s over %s', totalDamge.damage/combatDuration, totalDamge.damage, combatDuration);
  }

  function advanceTime(time){
    //advance the timeline and reduce all cooldowns and gcd
    combatTime = math.round(combatTime + time, 3);
    gcdRemaining = gcdRemaining - time;
    no_gcd_abilities.autoAttack.cooldownRemaining = no_gcd_abilities.autoAttack.cooldownRemaining - time;
    for(var n in abilities){
      if(abilities[n].remaining_cd > 0){
        abilities[n].remaining_cd = abilities[n].remaining_cd - time;
      } else {
        abilities[n].remaining_cd = 0;
      }

      if(abilities[n].remaining_dur > 0){
        abilities[n].remaining_dur = abilities[n].remaining_dur - time;
      } else {
        abilities[n].remaining_dur = 0;
      }
    }
  }

  function getSwingDamage(){
    if(mopMode){
      var ap2dps = 14;
    } else {
      var ap2dps = 3.5;
    }
    var weaponInfo = player.items.mainHand.weaponInfo;
    //min for paladins is (minDamage + ((attackPower/ap2dps)*weaponSpeed)) * 1.3
    //the 1.3 is specific to retribution paladins who get a 30% damage increase for using a 2handed weapon
    var min = (weaponInfo.damage.exactMin + ((player.stats.attackPower/ap2dps)*weaponInfo.weaponSpeed)) * 1.3;
    var max = (weaponInfo.damage.exactMax + ((player.stats.attackPower/ap2dps)*weaponInfo.weaponSpeed)) * 1.3;
    var swing = Math.round(_.random(min, max));
    return swing;
  }

  function avengingWrath(){
    if (abilities.avengingWrath.remaining_cd > 0 || gcdRemaining > 0) {
      return false;
    }

    abilities.avengingWrath.remaining_dur = abilities.avengingWrath.dur;
    abilities.avengingWrath.remaining_cd = abilities.avengingWrath.cd;
    log(combatTime, 'Avenging Wrath', 0, false, false);

    applyGCD();
  }

  function exorcism(){
    //Causes (117.1% of AttackPower) Holy Damage
    if(gcdRemaining > 0 || abilities.exorcism.remaining_cd > 0){
      return false;
    }

    var ability = 'Exorcism';
    var damage = Math.round((player.stats.attackPower * 1.171) * determineModifiers(ability, 1));
    var type = 'H';
    var crit = utils.isCrit(player.stats.crit);
    var cooldown = 15.0;
    cooldown = math.round(cooldown/(1+player.stats.haste/100), 3);
    //Set timer to remove Crusader Strike cooldown
    abilities.exorcism.remaining_cd = math.round(cooldown, 1);

    applyGCD();
    applyCensure();
    log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
    gainHolyPower();
    multistrike(damage, ability);
  }

  function hammerOfWrath(){
    //Causes (211.2% of SpellPower) Holy Damage
    if(gcdRemaining > 0 || abilities.hammerOfWrath.remaining_cd > 0){
      return false;
    }

    if(!(combatTime > (simDuration * .65) || abilities.avengingWrath.remaining_dur > 0)){
      return false;
    }

    var ability = 'Hammer of Wrath';
    var damage = Math.round((player.stats.spellPower * 2.112) * determineModifiers(ability, 1));
    var type = 'H';
    var crit = utils.isCrit(player.stats.crit);
    var cooldown = 6;
    cooldown = cooldown/(1+player.stats.haste/100);
    if(abilities.avengingWrath.sanctified && abilities.avengingWrath.remaining_dur > 0){
      cooldown = cooldown/2;
    }

    abilities.hammerOfWrath.remaining_cd = math.round(cooldown, 1);

    applyGCD();
    applyCensure();
    log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
    gainHolyPower();
    multistrike(damage, ability);
  }

  function judgement(){
    //Causes (50.21% Spell Power + 60.3% AttackPower) Holy Damage
    if(gcdRemaining > 0 || abilities.judgment.remaining_cd > 0){
      return false;
    }

    var ability = 'Judgment';
    var damage = Math.round(((player.stats.spellPower * .5021) + (player.stats.attackPower * .6031)) * determineModifiers(ability, 1));
    var type = 'H';
    var crit = utils.isCrit(player.stats.crit);
    var cooldown = 6.0;
    cooldown = math.round(cooldown/(1+player.stats.haste/100), 3);
    //Set timer to remove Crusader Strike cooldown
    abilities.judgment.remaining_cd = math.round(cooldown, 1);

    applyGCD();
    applyCensure();
    log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
    gainHolyPower();
    multistrike(damage, ability);
    handOfLight(damage);
  }


  function templarsVerdict(){
    //A powerful weapon strike that deals 185% Physical damage.
    if(!abilities.templarsVerdict || gcdRemaining > 0 || holyPower < 3){
      return false;
    }
    var ability = 'Templar\'s Verdict';
    var damage = Math.round(getSwingDamage() * 1.85);
    var modifier = determineModifiers(ability, 1);
    damage = Math.round(applyArmorReduction(damage * modifier));

    var type = 'P';
    var crit = utils.isCrit(player.stats.crit);

    applyGCD();
    applyCensure();
    log(combatTime, ability + ' - ' + holyPower + 'HP', crit ? damage * 2 : damage, crit, false);
    spendHolyPower(3);
    multistrike(damage, ability);
    handOfLight(damage);
  }

  function finalVerdict(){
    //Empowers your weapon with holy energy, and performs a devastating strike, dealing 280% Holy damage.
    //While Seal of Righteousness is active, Final Verdict will also deal 50% as much damage to all other enemies near the target.
    if(!abilities.finalVerdict || gcdRemaining > 0 || holyPower < 3){
      return false;
    }

    var ability = 'Final Verdict';
    var damage = Math.round(getSwingDamage() * 2.8 * determineModifiers(ability, 1));
    var type = 'H';
    var crit = utils.isCrit(player.stats.crit);
    applyGCD();
    //TODO: confirm final verdict procs censure
    applyCensure();
    log(combatTime, ability + ' - ' + holyPower + 'HP', crit ? damage * 2 : damage, crit, false);
    spendHolyPower(3);
    multistrike(damage, ability);
    handOfLight(damage);
  }

  function holyAvenger(){
    if (abilities.holyAvenger && abilities.holyAvenger.remaining_cd > 0 || gcdRemaining > 0 || !abilities.holyAvenger) {
      return false;
    }

    abilities.holyAvenger.remaining_dur = abilities.holyAvenger.dur;
    abilities.holyAvenger.remaining_cd = abilities.holyAvenger.cd;
    log(combatTime, 'Holy Avenger', 0, false, false);

    applyGCD();
  }

  function executionSentence(){
    if (abilities.executionSentence.remaining_cd > 0 || gcdRemaining > 0) {
      return false;
    }
    no_gcd_abilities.executionSentence.tickCount = 10;
    abilities.executionSentence.remaining_cd = abilities.executionSentence.cd;
    //immediately do the first tick of execution sentence
    executionSentenceTick();
    applyGCD();

  }

  function executionSentenceDamage(){
    var damage = player.stats.spellPower * 9142/1000;
    return Math.round(damage * (constants.wod.executionSentenceTicks[no_gcd_abilities.executionSentence.tickCount - 1]/100) * determineModifiers('Execution Sentence', 1));
  }

  function executionSentenceTick(){

    if(no_gcd_abilities.executionSentence.tickCount > 0 && (combatTime - no_gcd_abilities.executionSentence.lastTick >= 1)) {
      var ability = 'Execution Sentence';
      var damage = executionSentenceDamage();
      var crit = utils.isCrit(player.stats.crit);
      log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
      multistrike(damage, ability);
      no_gcd_abilities.executionSentence.lastTick = combatTime;
      no_gcd_abilities.executionSentence.tickCount = no_gcd_abilities.executionSentence.tickCount - 1;
    }

  }

  function autoAttack(){
    if(no_gcd_abilities.autoAttack.cooldownRemaining > 0){
      return false;
    }

    var ability = 'Auto Attack';
    var crit = utils.isCrit(player.stats.crit)
    var damage = getSwingDamage();
    var modifier = 1;
    modifier = determineModifiers(ability, modifier);
    damage = Math.round(applyArmorReduction(damage * modifier));
    log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
    multistrike(damage, ability);
    applyCensure();
    no_gcd_abilities.autoAttack.cooldownRemaining = math.round(player.items.mainHand.weaponInfo.weaponSpeed/(1+player.stats.haste/100), 3);
    if(utils.resetExorcism()){
      abilities.exorcism.remaining_cd = 0;
    }
  }

  function crusaderStrike(){
    //An instant strike that causes 100% Physical damage.
    //Cooldown 4.5 sec
    //6.0.1 (Sun Apr 06 2014) Build 18443
    //Is our ability off cooldown? If not abort.
    if (abilities.crusaderStrike.remaining_cd > 0 || gcdRemaining > 0) {
      return false;
    }
    var cooldown = 4.5;
    var damage = getSwingDamage();
    var modifier = 1;
    var ability = 'Crusader Strike';

    //Update our cooldown based on current haste.
    cooldown = math.round(cooldown/(1+player.stats.haste/100), 3);
    modifier = determineModifiers(ability, modifier);
    damage = Math.round(applyArmorReduction(damage * modifier));

    //Set timer to remove Crusader Strike cooldown
    abilities.crusaderStrike.remaining_cd = math.round(cooldown, 1);

    var crit = utils.isCrit(player.stats.crit);
    log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
    multistrike(damage, ability);
    applyCensure();
    gainHolyPower();
    handOfLight(damage);
    applyGCD();

  }

  function applyGCD(){
    gcdRemaining = (gcd / (1 + player.stats.haste/100)) > 1 ? (gcd / (1 + player.stats.haste/100)) : 1;
  }

  function applyCensure(){
    if(currentSeal === 'Truth'){
      if(no_gcd_abilities.censure.stacks < 5){
        no_gcd_abilities.censure.stacks++;
        no_gcd_abilities.censure.lastApplied = combatTime;
      } else {
        no_gcd_abilities.censure.stacks = 5;
        no_gcd_abilities.censure.lastApplied = combatTime;
      }

      if(no_gcd_abilities.censure.stacks === 1){
        //Immediately tick censure on first application
        censureTick();
      }
    }
  }

  function censureDamage(){
    if(mopMode){
      //Deals (107 ( + 9.4% of Spell power) * 5) additional Holy damage over 15 sec. Stacks up to 5 times.
      var damage = 107 + (((player.stats.attackPower/2) * 0.094) * 5);
    } else {
      //Deals ((5.148% of Spell power) * 5) additional Holy damage over 15 sec. Stacks up to 5 times.
      var damage = (player.stats.spellPower * .05148) * no_gcd_abilities.censure.stacks;
    }
    damage = damage * determineModifiers('Censure', 1);
    return Math.round(damage);
  }

  function censureTick(){
    //if there hasn't been a censure application in the past 15 seconds, it's falling off, remove it
    if(combatTime - no_gcd_abilities.censure.lastApplied > 15){
      no_gcd_abilities.censure.stacks = 0;
    }

    if(no_gcd_abilities.censure.stacks > 0 && ((combatTime - no_gcd_abilities.censure.lastTick >= 3) || combatTime == no_gcd_abilities.censure.lastApplied)) {
      var ability = 'Censure';
      var damage = censureDamage();

      var crit = utils.isCrit(player.stats.crit);
      log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
      no_gcd_abilities.censure.lastTick = combatTime;
    }
  }

  function handOfLight(damage){
    var ability = 'Hand of Light';
    //TODO: change modifier to calculated, otherwise numbers are screwed
    //var modifier  = player.stats.mastery/100;
    //debug('mastery %s', player.stats.mastery/100)
    var modifier = .58;
    damage = Math.round(damage * modifier);
    var crit = utils.isCrit(player.stats.crit);
    log(combatTime, ability, crit ? damage * 2 : damage, crit, false);
    //TODO: Check if Hand of Light can proc multistrike
    multistrike(damage, ability);

    return damage;
  };

  function gainHolyPower(){
    var total;
    if(abilities.holyAvenger && abilities.holyAvenger.remaining_dur > 0){
      total = holyPower + 3;
    } else {
      total = holyPower + 1
    }

    if(total <= 5){
      holyPower = total;
    } else {
      holyPower = 5;
    }
  };

  function spendHolyPower(hp){
    var total = holyPower - ( hp || 3);

    if(total < 0){
      throw new Error('Holy Power cannot go below 0. Check your logic.');
    }

    holyPower = total;
  };

  function multistrike(damage, ability){
    //Multistrike will do 30% damage of original hit
    damage = Math.round(damage * .3);
    var crit;

    //You get two independent chances to multistrike, each can independently crit
    if(utils.isMultistrike(player.stats.multistrike)){
      crit = utils.isCrit(player.stats.crit);
      log(combatTime, ability, crit ? damage * 2 : damage, crit, true);
    }
    if(utils.isMultistrike(player.stats.multistrike)){
      crit = utils.isCrit(player.stats.crit);
      log(combatTime, ability, crit ? damage * 2 : damage, crit, true);
    }
  }

  function applyArmorReduction(damage){
    return damage * (1-.3493);
  }

  function determineModifiers(ability, modifier, type){
    modifier = modifier || 1;
    var holyAvengerAbilities = ['Crusader Strike', 'Judgment', 'Exorcism'];

    if(abilities.avengingWrath.remaining_dur > 0){
      modifier = modifier + .2;
    }

    if(abilities.holyAvenger && abilities.holyAvenger.remaining_dur > 0 && holyAvengerAbilities.indexOf(ability) != -1){
      modifier = modifier + .3;
    }

    if(buffs.sunderArmor){
      modifier = modifier + .05;
    }

    if(buffs.improvedCrusaderStrike && ability == 'Crusader Strike'){
      modifier = modifier + .2;
    }

    if(buffs.improvedJudgment && ability == 'Judgment'){
      modifier = modifier + .2;
    }

    if(buffs.improvedExorcism && ability == 'Exorcism'){
      modifier = modifier + .2;
    }

    if(buffs.empoweredSealsTruth && ability == 'Censure'){
      modifier = modifier + .2;
    }

    return modifier;

  }


  function log(time, ability, damage, isCrit, isMulti){
    combatLog[combatLog.length] = {
      ability: ability,
      damage: damage,
      time: time,
      multistrike: isMulti || false,
      crit: isCrit || false
    }
  }

  function statSquish(){
    player.stats.str = squish(player.stats.str);
    player.stats.critRating = squish(player.stats.critRating);
    player.stats.hasteRating = squish(player.stats.hasteRating);
    player.stats.masteryRating = squish(player.stats.masteryRating);
    player.stats.versatility = 0;
    player.stats.multistrike = 0;
    player.items.mainHand.weaponInfo.damage.exactMin = Math.round(squish(player.items.mainHand.weaponInfo.damage.exactMin)/2);
    player.items.mainHand.weaponInfo.damage.exactMax = Math.round(squish(player.items.mainHand.weaponInfo.damage.exactMax)/2);

    player.stats.spellPower = player.stats.attackPower;
  }

  function squish(value){
    return Math.round(value * .0390);
  }

  function setRaidBuffs(raidBuffs){
    if(raidBuffs.indexOf('crit')){
      player.stats.crit = math.round(player.stats.crit + 5, 2);
    }

    if(raidBuffs.indexOf('haste')){
      player.stats.haste = math.round(player.stats.haste + 5, 2);
    }

    if(raidBuffs.indexOf('stats')){
      if(mopMode){
        player.stats.strength = player.stats.str + (player.stats.str * .05);
        player.stats.attackPower = (player.level * 3) + (player.stats.str * 2);
      } else {
        //TODO: find out real base values of str in WoD to fix this calc
        player.stats.strength = player.stats.str + (player.stats.str * .05);
        player.stats.attackPower = constants.wod.baseStats.strength[100] + player.stats.str;
        player.stats.spellPower = player.stats.attackPower;
      }
    }

    if(raidBuffs.indexOf('mastery')){
      if(mopMode){
        player.stats.masteryRating = player.stats.masteryRating + 3000;
        player.stats.mastery = constants.mop.baseMastery
          + (player.stats.masteryRating/constants.mop.combatRatings.mastery);
      } else {
        player.stats.masteryRating =  player.stats.masteryRating + 550;
        //account for attunement: mastery
        player.stats.masteryRating = player.stats.masteryRating * 1.05;

        player.stats.mastery = math.round(constants.wod.baseMastery
          + (player.stats.masteryRating/constants.wod.combatRatings[player.level].mastery), 2);
      }
    }
  }

  this.getLog = function(){
    return combatLog;
  }

  this.getStats = function(){
    return stats;
  }

  this.getTalents = function(){
    return talents;
  }

  sim();
}

function determineAbilities(talents){
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

  /*TODO: uncomment this
  if(!_.where(talents, {'spell': {'name': 'Final Verdict' } }).length){
    debug('Final Verdict talent not found, removing ability');
    delete abilities.finalVerdict;
  } else {
    debug('Final Verdict talent found, removing Templar\'s Verdict');
    delete abilities.templarsVerdict;
  }*/
  debug('Final Verdict talent found, removing Templar\'s Verdict');
  delete abilities.templarsVerdict;

  return abilities;

}

var test = new Paladin(player, 380);

module.exports = Paladin;