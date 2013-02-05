BaseStats = require('./base_stats')
utils = require('lib/utils')


class X2Stats extends BaseStats

    constructor: (user) ->
        @weight = user.get('weight')
        @phase = user.getPhase()
        @program = user.get('program')
        @dab = user.get('dab')
        @de = user.get('de')
        @sway = user.get('sway')

        @calorieBracket = @getCalorieBracket()
        @calories = @getCalories()

    getCalorieBracket: =>
        rmr = utils.roundFloat @calcRMR(@weight), 1
        dab = utils.roundFloat @calcDAB(rmr, @dab), 1
        rawCals = utils.roundFloat @calcRawCals(rmr, dab, @de, @sway), 1
        cals = @roundCalsToBracket(rawCals)

        {rmr, dab, @de, @sway, rawCals, cals}

    getMacroBreakdown: =>
        if @phase is 'energy_booster'
            '30/40/30'
        else if @phase is 'endurance_maximizer'
            '25/50/25'
        else
            '50/25/25'

    getDisplayStats: =>
        [
            {display: 'Phase', val: @phase.toDisplay()}
            {display: 'Macro Breakdown (P/C/F)', val: @getMacroBreakdown()}
            {display: 'Resting Metabolic Rate', val: @calorieBracket.rmr}
            {display: 'Daily Activity Burn', val: @calorieBracket.dab}
            {display: 'Daily Exercise', val: @calorieBracket.de}
            {display: 'Caloric Surplus / Deficit', val: @calorieBracket.sway}
            {display: 'Calories needed', val: @calorieBracket.rawCals}
            {display: 'Calorie Bracket', val: @calorieBracket.cals}
        ]

    calcRMR: (lbm) ->
        lbm * 10

    calcDAB: (rmr, dab) ->
        rmr * dab

    calcRawCals: (rmr, dab, de, sway) ->
        rmr + dab + de + sway

    roundCalsToBracket: (rawCals) ->
        if rawCals < 2400
            return 1800
        else if rawCals < 3000
            return 2400
        else
            return 3000


module.exports = X2Stats
