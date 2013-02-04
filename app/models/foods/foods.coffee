class Foods
    macros: {}

    constructor: (@user, @macro, @food) ->
        if @user.isConfigured()
            @ALL_MACROS = require("./#{@user.getProgram()}/all_macros")
            for macro, display of @ALL_MACROS
                @macros[macro] = require("./#{@user.getProgram()}/#{macro}")

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


module.exports = Foods
