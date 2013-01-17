BeastBrackets = require('./calorie_brackets/beast_brackets')


class Stats

    constructor: (user) ->
        @weight = user.get('weight')
        @bfp = user.get('bfp')
        @phase = user.get('phase')
        @calorieBracket = @getCalorieBracket()

    getCalorieBracket: =>
        lbm = @lbm(@weight, @bfp)
        rmr = @rmr(lbm)
        cmr = @cmr(rmr)
        rmr2 = @rmr2(rmr, cmr)
        cim = @cim(rmr2)

        if @phase is 'build'
            rawCals = @build(@bfp, cim)
        else
            rawCals = @beast(@bfp, cim)
        cals = @roundCalsToBracket(rawCals, @phase)

        {lbm, rmr, cmr, rmr2, cim, rawCals, cals}

    getCalories: =>
        @calorieBracket.cals

    getGoals: =>
        goals = BeastBrackets.getBracket(@getCalories(), @phase)
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


module.exports = Stats
