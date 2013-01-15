utils = require('./utils')


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
    return window.app.model.getMacroPercentage(macro)

Handlebars.registerHelper "getGoalForMacro", (macro) ->
    return window.app.model.getGoalForMacro(macro)

Handlebars.registerHelper "ifIsExceedingGoal", (macro, block) ->
    if window.app.model.isExceedingGoal(macro)
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
