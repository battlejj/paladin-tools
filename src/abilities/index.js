var _ = require('lodash');
var AutoAttack = require('./AutoAttack')
  , AvengingWrath = require('./AvengingWrath')
  , Censure = require('./Censure')
  , CrusaderStrike = require('./CrusaderStrike')
  , ExecutionSentence = require('./ExecutionSentence')
  , Exorcism = require('./Exorcism')
  , FinalVerdict = require('./FinalVerdict')
  , HammerOfWrath = require('./HammerOfWrath')
  , HolyAvenger = require('./HolyAvenger')
  , Judgment = require('./Judgment')
  , LightsHammer = require('./LightsHammer')
  , TemplarsVerdict = require('./TemplarsVerdict')
  ;

/*
TODO: Implement - Divine Purpose, Empowered Seals, Holy Prism and Seraphim when their use is better understood in WoD
 */
var abilities = {
  AutoAttack: AutoAttack
  , AvengingWrath: AvengingWrath
  , Censure: Censure
  , CrusaderStrike: CrusaderStrike
  , DivinePurpose: {}
  , EmpoweredSeals: {}
  , ExecutionSentence: ExecutionSentence
  , Exorcism: Exorcism
  , FinalVerdict: FinalVerdict
  , HammerOfWrath: HammerOfWrath
  , HolyAvenger: HolyAvenger
  , HolyPrism: {}
  , Judgment: Judgment
  , LightsHammer: LightsHammer
  , TemplarsVerdict: TemplarsVerdict
  , Seraphim: {}
};

module.exports = abilities;