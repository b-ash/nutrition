class Stats

    constructor: (@weight, @bfp, @phase) ->
        @calorieBracket = @getCalorieBracket()

    getCalorieBracket: =>
        lbm = @lbm(@weight, @bfp)
        rmr = @rmr(lbm)
        cmr = @cmr(rmr)
        rmr2 = @rmr2(rmr, cmr)
        cim = @cim(rmr2)

        if @phase is 'build' or @phase is 'bulk'
            cals = @build(@bfp, cim)
        else
            cals = @beast(@bfp, cim)

        {lbm, rmr, cmr, rmr2, cim, cals}

    toJSON: ->
        lbm = @lbm(@weight, @bfp)
        rmr = @rmr(lbm)
        cmr = @cmr(rmr)
        rmr2 = @rmr2(rmr, cmr)
        cim = @cim(rmr2)

        if @phase is 'build' or @phase is 'bulk'
            cals = @build(bfp, cim)
        else
            cals = @beast(bfp, cim)

        return stats: [
            {display: 'Lean Body Mass', val: lbm}
            {display: 'Resting Metabolic Rate', val: rmr}
            {display: 'Caloric Modification for Recovery', val: cmr}
            {display: 'RMR Modified for Recovery', val: rmr2}
            {display: 'Calorie Intake to Maintain Weight', val: cim}
            {display: 'Calories needed to build / bulk', val: cals}
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


module.exports = Stats
