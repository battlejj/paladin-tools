"use strict";

var math = require('mathjs')
  , constants = require('./src/lib/constants')
  , utils = require('./src/lib/utils')
  ;

var percent = (1/100);

function Player(data, buffs){
  this.stats = {
    buffed: {},
    unbuffed: {}
  };

  //Paladins by default has crit and mastery %
  this.baseCrit = constants.wod.baseStats.crit * percent;
  this.baseMastery = constants.wod.baseStats.mastery * percent;

  //Handle Primary Stats
  this.stats.unbuffed.strength = this.stats.unbuffed.attackPower
    = this.stats.unbuffed.spellPower
    = data.strength || constants.wod.baseStats.strength;

  //Handle Secondary Stat Ratings
  this.stats.unbuffed.critRating = data.critRating || 0;
  this.stats.unbuffed.hasteRating = data.hasteRating || 0;
  this.stats.unbuffed.masteryRating = data.masteryRating || 0;
  this.stats.unbuffed.multistrikeRating = data.multistrikeRating || 0;
  this.stats.unbuffed.versatilityRating = data.versatilityRating || 0;

  //Handle Secondary Stat Percents
  this.stats.unbuffed.critPercent = this.baseCrit + utils.ratingToPercent('crit', this.stats.unbuffed.critRating);
  this.stats.unbuffed.hastePercent = utils.ratingToPercent('haste', this.stats.unbuffed.hasteRating);
  this.stats.unbuffed.masteryPercent = math.round(this.baseMastery +
    (utils.ratingToPercent('mastery', this.stats.unbuffed.masteryRating) * 1.05), 4);
  this.stats.unbuffed.multistrikePercent = utils.ratingToPercent('multistrike', this.stats.unbuffed.multistrikeRating);
  this.stats.unbuffed.versatilityPercent = utils.ratingToPercent('versatility', this.stats.unbuffed.versatilityRating);

  //Configure the base stats in our buffed object
  this.resetBuffs();

  if(buffs.indexOf('stats') != -1){
    this.buffStat('strength');
  }

  if(buffs.indexOf('crit') != -1){
    this.buffCritPercent();
  }

  if(buffs.indexOf('haste') != -1){
    this.buffHastePercent();
  }

  if(buffs.indexOf('mastery') != -1){
    this.buffMasteryPercent();
  }

  if(buffs.indexOf('multistrike') != -1){
    this.buffMultistrikePercent();
  }

  if(buffs.indexOf('versatility') != -1){
    this.buffVersatilityPercent();
  }

  if(buffs.indexOf('attackPower') != -1){
    this.buffAttackPower();
  }

};

Player.prototype.buffStat = function(stat){
  //Increase stat by 5%
  var buff = this.stats.unbuffed[stat] * (5 * percent);
  this.stats.buffed[stat] = math.round(this.stats.unbuffed[stat] + buff);

  return this.stats.buffed[stat];
};

Player.prototype.buffCritPercent = function(){
  //Increase crit by 5%
  var buff = 5 * percent;
  this.stats.buffed.critPercent = math.round(this.stats.unbuffed.critPercent + buff, 4);

  return this.stats.buffed.critPercent;
};

Player.prototype.buffMasteryPercent = function(){
  //Increase mastery rating by 550
  var buff = 550;
  //Add our buff to our mastery rating
  var buffedRating = this.stats.unbuffed.masteryRating + buff;
  //Add mastery attunement, 5% increase mastery from all sources
  var attunedPercent = utils.ratingToPercent('mastery', buffedRating) * 1.05;
  this.stats.buffed.masteryPercent = math.round(this.baseMastery + attunedPercent, 4);

  return this.stats.buffed.masteryPercent;
};

Player.prototype.buffHastePercent = function(){
  //Increase crit by 5%
  var buff = 5 * percent;
  this.stats.buffed.hastePercent = math.round(this.stats.unbuffed.hastePercent + buff, 4);

  return this.stats.buffed.hastePercent;
};

Player.prototype.buffMultistrikePercent = function(){
  //Increase multistrike by 5%
  var buff = 5 * percent;
  this.stats.buffed.multistrikePercent = math.round(this.stats.unbuffed.multistrikePercent + buff, 4);

  return this.stats.buffed.multistrikePercent;
};

Player.prototype.buffVersatilityPercent = function(){
  //Increase versatility by 3%
  var buff = 3 * percent;
  this.stats.buffed.versatilityPercent = math.round(this.stats.unbuffed.versatilityPercent + buff, 4);

  return this.stats.buffed.versatilityPercent;
};

Player.prototype.buffAttackPower = function(){
  //Increase attack power by 10%
  var buff = 10 * percent;
  this.stats.buffed.versatilityPercent = math.round(this.stats.unbuffed.attackPower + buff, 4);
}

Player.prototype.resetBuffs = function(){
  for(var s in this.stats.unbuffed){
    if(this.stats.unbuffed.hasOwnProperty(s)){
      this.stats.buffed[s] = this.stats.unbuffed[s];
    }
  }
};

module.exports = Player;

//var p = new Player({masteryRating: 1500, critRating: 200}, ['stats', 'crit', 'mastery', 'versatility', 'multistrike']);