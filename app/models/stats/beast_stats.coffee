CalorieBrackets = require('models/calorie_brackets/calorie_brackets')
utils = require('lib/utils')


class BeastStats
    
    constructor: (user) ->
        @weight = user.get('weight')
        @bfp = user.get('bfp')
        @phase = user.getPhase()
        @program = user.get('program')
        @calorieBracket = @getCalorieBracket()
        @calories = @getCalories()

    getCalorieBracket: =>
        lbm = utils.roundFloat @lbm(@weight, @bfp), 1
        rmr = utils.roundFloat @rmr(lbm), 1
        cmr = utils.roundFloat @cmr(rmr), 1
        rmr2 = utils.roundFloat @rmr2(rmr, cmr), 1
        cim = utils.roundFloat @cim(rmr2), 1

        if @phase is 'build'
            rawCals = utils.roundFloat @build(@bfp, cim), 1
        else
            rawCals = utils.roundFloat @beast(@bfp, cim), 1
        cals = @roundCalsToBracket(rawCals, @phase)

        {lbm, rmr, cmr, rmr2, cim, rawCals, cals}

    getCalories: =>
        @calorieBracket.cals

    getGoals: =>
        goals = CalorieBrackets.getBracket(@)
        goals.goals

    getMacroBreakdown: =>
        if @phase is 'build'
            '25/50/25'
        else
            '40/30/30'

    toJSON: ->
        return stats: [
            {display: 'Phase', val: @phase.capitalize()}
            {display: 'Macro Breakdown', val: @getMacroBreakdown()}
            {display: 'Lean Body Mass', val: @calorieBracket.lbm}
            {display: 'Resting Metabolic Rate', val: @calorieBracket.rmr}
            {display: 'Caloric Modification for Recovery', val: @calorieBracket.cmr}
            {display: 'RMR Modified for Recovery', val: @calorieBracket.rmr2}
            {display: 'Calorie Intake to Maintain Weight', val: @calorieBracket.cim}
            {display: "Calories needed to #{@phase}", val: @calorieBracket.rawCals}
            {display: 'Calorie Bracket', val: @calorieBracket.cals}
        ]

    lbm: (weight, bfp) ->
        (100 - bfp) / 100 * weight

    rmr: (lbm) ->
        lbm * 10

    cmr: (rmr) ->
        rmr * 0.3

    rmr2: (rmr, cmr) ->
        rmr + cmr

    cim: (rmr2) ->
        rmr2 + 600

    build: (bfp, cim) ->
        if bfp > 20
            cim + (cim * 0.1)
        else if bfp > 10
            cim + (cim * 0.15)
        else
            cim + (cim * 0.2)

    beast: (bfp, cim) ->
        if bfp > 20
            cim - (cim * 0.2)
        else if bfp > 10
            cim - (cim * 0.15)
        else
            cim - (cim * 0.1)

    roundCalsToBracket: (rawCals, phase) ->
        if phase is 'build'
            cals = Math.ceil(rawCals / 200) * 200
            return @getCalsBetweenValues(cals, 2000, 5000)
        else
            cals = Math.floor(rawCals / 200) * 200
            return @getCalsBetweenValues(cals, 1800, 4800)

    getCalsBetweenValues: (cals, lowerBound, upperBound) ->
        if cals < lowerBound
            lowerBound
        else if cals > upperBound
            upperBound
        else
            cals


module.exports = BeastStats
