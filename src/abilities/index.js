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

var abilities = {
  AutoAttack: AutoAttack
  , AvengingWrath: AvengingWrath
  , Censure: Censure
  , CrusaderStrike: CrusaderStrike
  , ExecutionSentence: ExecutionSentence
  , Exorcism: Exorcism
  , FinalVerdict: FinalVerdict
  , HammerOfWrath: HammerOfWrath
  , HolyAvenger: HolyAvenger
  , Judgment: Judgment
  , LightsHammer: LightsHammer
  , TemplarsVerdict: TemplarsVerdict
};

module.exports = abilities;