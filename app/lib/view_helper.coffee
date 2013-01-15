# Put handlebars.js helpers here

Handlebars.registerHelper "debug", (optionalValue) ->
    console.log("Current Context")
    console.log("====================")
    console.log(@)

    if optionalValue && optionalValue.hash == undefined
        console.log("Value")
        console.log("====================")
        console.log(optionalValue)

Handlebars.registerHelper "keys", (list, fn) ->
    buffer = ''

    for key, val of list
        buffer += fn {key: key, val: val}

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
