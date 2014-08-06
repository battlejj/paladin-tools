module.exports = {
  wod: {
    combatRatings: {
      100: {
        crit: 110,
        haste: 100,
        mastery: 59.45 ,
        multi: 66,
        pow: 49,
        sta: 60
      },
      99: {
        crit: 95,
        haste: 69,
        mastery: 95,
        multi: 58,
        pow: 42,
        sta: 60
      },
      90: {
        crit: 23,
        haste: 16,
        mastery: 23,
        multi: 14,
        pow: 10,
        sta: 49
      }
    }, baseMastery: 14.8
    , baseStats: {
        strength: {
          90: 158,
          100: 1533
        }
        , crit: 5
        , mastery: 14.8
    }
    , executionSentenceTicks: [44, 9, 8, 7.5, 6.5, 6, 5.5, 5, 4.5, 4]
    , attackPowerToDPS: 3.5
    , globalCooldown: 1.5
    , normalized2H: 3.3
  },
  mop: {
    combatRatings: {
      crit: 600,
      haste: 425,
      mastery: 324.5,
      multi: 0,
      pow: 0,
      sta: 0
    },
    baseMastery: 14.8
    , baseStats: {
      strength: {
        90: 270
      }
    }
    , executionSentenceTicks: [44, 9, 8, 7.5, 6.5, 6, 5.5, 5, 4.5, 4]
  }
}