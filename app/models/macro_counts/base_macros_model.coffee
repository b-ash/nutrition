utils = require('lib/utils')
LocalStorageModel = require('models/local_storage_model')
Foods = require('models/foods/foods')


# Base nutrition macro requirements to be extended
class BaseMacrosModel extends LocalStorageModel

    id: 'macro-counts'
    totalCals: 0

    initialize: (stats) =>
        @fetch()
        @goals = stats.getGoals()
        @foods = new Foods(app.user)
        @calculateTotalCals()

    increment: (macro, amt=0.5) =>
        @changeByAmount(macro, amt)

    decrement: (macro, amt=-0.5) =>
        @changeByAmount(macro, amt)

    changeByAmount: (macro, amt) =>
        macros = @get('macros')

        newCount = Math.max (macros[macro].count + parseFloat(amt)), 0
        cals = @foods.getCalories(macro)
        @totalCals = Math.max (@totalCals + (amt * cals)), 0

        macros[macro].count = newCount
        @save('macros', macros)

    getMacroPercentage: (macro) =>
        goal = @getGoalForMacro(macro)
        macro = @get('macros')[macro].count
        percentage = (macro / goal) * 100
        return Math.min(utils.roundFloat(percentage), 100)

    getTotalCals: =>
        @totalCals

    calculateTotalCals: =>
        for name, macro of @get('macros')
            cals = @foods.getCalories(name)
            if cals?
                @totalCals += (macro.count * cals)
        @

    getGoalForMacro: (macro) =>
        @goals[macro]

    isExceedingGoal: (macro) =>
        goal = @getGoalForMacro(macro)
        macro = @get('macros')[macro].count
        return macro > goal

    clear: =>
        @save @defaults()
        @totalCals = 0
        @trigger('cleared')


module.exports = BaseMacrosModel
