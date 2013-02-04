class BaseFoods
    macros: {}

    constructor: (@program, @macro, @food) ->
        @ALL_MACROS = require("./#{@program.program}/all_macros")
        for macro, display of @ALL_MACROS
            @macros[macro] = require("./#{@program}/#{macro}")

    toJSON: () =>
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
            return @ALL_MACROS

    getCalories: (macro=@macro) =>
        @macros[macro]['cals']


module.exports = BaseFoods
