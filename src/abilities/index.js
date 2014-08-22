var _ = require('lodash');
var AutoAttack = require('./AutoAttack')
  , AvengingWrath = require('./AvengingWrath')
  , Censure = require('./Censure')
  , CrusaderStrike = require('./CrusaderStrike')
  , DivinePurpose = require('./DivinePurpose')
  , EmpoweredSeals = require('./EmpoweredSeals')
  , ExecutionSentence = require('./ExecutionSentence')
  , Exorcism = require('./Exorcism')
  , FinalVerdict = require('./FinalVerdict')
  , HammerOfWrath = require('./HammerOfWrath')
  , HolyAvenger = require('./HolyAvenger')
  , HolyPrism = require('./HolyPrism')
  , Judgment = require('./Judgment')
  , LightsHammer = require('./LightsHammer')
  , TemplarsVerdict = require('./TemplarsVerdict')
  , Seraphim = require('./Seraphim')
  ;

/*
TODO: Implement - Divine Purpose, Empowered Seals, Holy Prism and Seraphim when their use is better understood in WoD
 */
var abilities = {
  AutoAttack: AutoAttack
  , AvengingWrath: AvengingWrath
  , Censure: Censure
  , CrusaderStrike: CrusaderStrike
  , DivinePurpose: DivinePurpose
  , EmpoweredSeals: EmpoweredSeals
  , ExecutionSentence: ExecutionSentence
  , Exorcism: Exorcism
  , FinalVerdict: FinalVerdict
  , HammerOfWrath: HammerOfWrath
  , HolyAvenger: HolyAvenger
  , HolyPrism: HolyPrism
  , Judgment: Judgment
  , LightsHammer: LightsHammer
  , TemplarsVerdict: TemplarsVerdict
  , Seraphim: Seraphim
};

module.exports = abilities;