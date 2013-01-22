ALL_MACROS = require('./beast/all_macros')

class BeastFoods
    macros: {}

    constructor: (@macro, @food) ->
        for macro, display of ALL_MACROS
            @macros[macro] = require("./beast/#{macro}")

    toJSON: =>
        if @macro?
            macro = @macros[@macro] or {food: {}}

            if @food?
                food = macro.foods[@food]
                food.macro = macro.macro
                food.macroOverride = macro.macroOverride
                food.cals = macro.cals
                return food
            else
                return macro
        else
            return ALL_MACROS

    get: (key) =>
        if @macro and @macro isnt 'shake'
            @macros[@macro][key]


module.exports = BeastFoods
