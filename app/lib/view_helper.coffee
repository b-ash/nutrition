utils = require('lib/utils')
Foods = require('models/foods/foods')


Handlebars.registerHelper "debug", (optionalValue) ->
    console.log("Current Context")
    console.log("====================")
    console.log(@)

    if optionalValue && optionalValue.hash == undefined
        console.log("Value")
        console.log("====================")
        console.log(optionalValue)

Handlebars.registerHelper "keys", (list, ctx, fn) ->
    buffer = ''

    for key, val of list
        buffer += fn {key: key, val: val, ctx: ctx}

    return buffer

Handlebars.registerHelper "getPercentageWidth", (macro) ->
    return window.app.macros.getMacroPercentage(macro)

Handlebars.registerHelper "getGoalForMacro", (macro) ->
    return window.app.macros.getGoalForMacro(macro)

Handlebars.registerHelper "getCalsDisplayForMacro", (macro, amt) ->
    cals = new Foods(window.app.user).getCalories(macro)
    if cals?
        return " - #{amt * cals} cals"
    else
        return ''

Handlebars.registerHelper "getTotalCals", (macros) ->
    return window.app.macros.getTotalCals()

Handlebars.registerHelper "ifIsExceedingGoal", (macro, block) ->
    if window.app.macros.isExceedingGoal(macro)
        return block(this)
    else
        return block.inverse(this)

Handlebars.registerHelper "getExactPortion", (ctx, serving) ->
    serving = parseFloat(serving)
    portion = ctx.portion

    totalServingSize = utils.roundFloat(portion * serving)
    measurement = utils.pluralize(ctx.measurement, totalServingSize)

    return "#{totalServingSize} #{measurement}"

Handlebars.registerHelper "pluralize", (word, quantity) ->
    utils.pluralize(word, quantity)
