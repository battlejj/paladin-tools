var _ = require('lodash');
var utils = require('./lib/utils.js');
var player = require('./player.js');

function Paladin(player, inactiveSpec){
  var self = this;
  this.combatTime = 0;
  var combatLog = [];
  var holyPower = 0;

  var buff = {
    avengingWrath: false,
    holyAvenger: false,
    sunderArmor: true,
    seraphim: false,
    empoweredSealsTruth: false,
    empoweredSealsRighteous: false,
    improvedCrusaderStrike: true
  };

  var no_gcd_abilities = {
    autoAttack: {weaponSpeed: (player.stats.mainHandSpeed * (1 + player.stats.haste)), cooldownRemaining: player.stats.mainHandSpeed},
    censure: {cooldown: 3, stacks: 0, lastTick: 0}
  }

  var abilities = {
    //avengingWrath: { ready: true, cooldownRemaining: 0 },
    crusaderStrike: { ready: true, cooldownRemaining: 0 },
    //divinePurpose: { ready: true, cooldownRemaining: 0 },
    //divineStorm: { ready: true, cooldownRemaining: 0 },
    //empoweredSeals: { ready: true, cooldownRemaining: 0 },
    //executionSentence: { ready: true, cooldownRemaining: 0 },
    //exorcism: { ready: true, cooldownRemaining: 0 },
    judgment: { ready: true, cooldownRemaining: 0 }//,
    //hammerOfTheRighteous: { ready: true, cooldownRemaining: 0 },
    //hammerOfWrath: { ready: true, cooldownRemaining: 0 },
    //holyAvenger: { ready: true, cooldownRemaining: 0 },
    //holyPrism: { ready: true, cooldownRemaining: 0 },
    //lightsHammer: { ready: true, cooldownRemaining: 0 },
    //seraphim: { ready: true, cooldownRemaining: 0 }
  };


  this.talents = inactiveSpec
    ? (player.talents[0].selected ? player.talents[1] : player.talents[0].talents)
    : (player.talents[0].selected ? player.talents[0] : player.talents[1].talents);


  function next(advance){
    if(no_gcd_abilities.censure.stacks > 0 && (self.combatTime - no_gcd_abilities.censure.lastTick >= 3)){
      censureTick();
    }

    autoAttack();

    self.combatTime += advance || .1;
    if(self.combatTime > 30){
      console.log(combatLog)
      return combatLog;
    }
    return next()
  }

  function gcd(){

  }

  function avengingWrath(modifier){
    return buff.avengingWrath ? modifier + .2 : modifier;
  }

  function holyAvenger(modifier){
    return buff.holyAvenger ? modifier + .3 : modifier;
  }

  function sunderArmor(modifier){
    return buff.sunderArmor ? modifier + .05 : modifier;
  }

  function improvedCrusaderStrike(modifier){
    return buff.improvedCrusaderStrike ? modifier + .2 : modifier;
  }

  function autoAttack(){
    var ability = 'Auto Attack';
    var damage = (player.stats.mainHandDmgMax + player.stats.mainHandDmgMin) / 2;
    var modifier = 1;
    modifier = sunderArmor(holyAvenger(avengingWrath(modifier)));
    damage = damage * modifier;
    if(no_gcd_abilities.autoAttack.cooldownRemaining <= 0){
      var crit = utils.isCrit(player.stats.crit)
      log(ability, crit ? damage * 2 : damage, self.combatTime, false, crit);
      multistrike(damage, ability);
      applyCensure();
      no_gcd_abilities.autoAttack.cooldownRemaining = no_gcd_abilities.autoAttack.weaponSpeed / (1 + player.stats.haste);
    } else {
      no_gcd_abilities.autoAttack.cooldownRemaining -= .1;
    }
  }

  function crusaderStrike(){
    //An instant strike that causes 100% Physical damage.
    //Cooldown 4.5 sec
    //6.0.1 (Sun Apr 06 2014) Build 18443
    var baseCooldown = 4.5;
    var baseDamage = (player.stats.mainHandDmgMin + player.stats.mainHandDmgMax) / 2

    //Is our ability off cooldown? If not abort.
    if (abilities.crusaderStrike.cooldown > 0) {
      abilities.crusaderStrike.cooldownRemaining -= .1;
      return false;
    }
    var cooldown = baseCooldown;
    var damage = baseDamage;
    var holyPowerGain = 1;
    var modifier = 1;

    //Update our cooldown based on current haste.
    cooldown = cooldown / (1 + self.stats.haste/100);
    modifier = sunderArmor(holyAvenger(avengingWrath(modifier)));
    damage = damage * modifier;

    //Set timer to remove Crusader Strike cooldown
    abilities.crusaderStrike.cooldown = cooldown;

    gainHolyPower(holyPowerGain);

    log('Crusader Strike', damage,
    self.multistrike(damage, 'Crusader Strike');
    self.handOfLight(damage);
    self.tl(1.5/(1 + self.stats.haste/seconds), true);
  }

  function gainHolyPower(hp){
    var total = holyPower + ( hp || 1);

    if(total <= 5){
      holyPower = total;
    } else {
      holyPower = 5;
    }
  };

  function applyCensure(){
    if(no_gcd_abilities.censure.stacks < 5){
      no_gcd_abilities.censure.stacks++;
    }

    if(no_gcd_abilities.censure.stacks === 1){
      censureTick()
    }

  }

  function censureTick(){
    var ability = 'Censure';
    //Deals ((5.148% of Spell power) * 5) additional Holy damage over 15 sec. Stacks up to 5 times.
    var damage = (player.stats.spellPower * .05148) * no_gcd_abilities.censure.stacks;
    log(ability, utils.isCrit() ? damage * 2 : damage, self.combatTime);
    no_gcd_abilities.censure.lastTick = self.combatTime;
    //can censure multistrike?
    //multistrike(damage, ability);
  }

  function multistrike(damage, ability){
    //Multistrike will do 30% damage of original hit
    damage = damage * .3
    var crit;

    //You get two independent chances to multistrike, each can independently crit
    if(utils.isMultistrike(player.stats.multistrike)){
      crit = utils.isCrit(player.stats.crit);
      log(ability, crit ? damage * 2 : damage, self.combatTime, true, crit);
    }
    if(utils.isMultistrike(player.stats.multistrike)){
      crit = utils.isCrit(player.stats.crit);
      log(ability, crit ? damage * 2 : damage, self.combatTime, true, crit);
    }
  }

  function log(ability, damage, time, multistrike, crit){
    combatLog[combatLog.length] = {
      ability: ability,
      damage: damage,
      time: time,
      multistrike: multistrike || false,
      crit: crit || false
    }
  }

  next();
}

var p = new Paladin(player);
//console.log(p.abilities);



