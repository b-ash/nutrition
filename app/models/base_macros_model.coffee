utils = require('lib/utils')
LocalStorageModel = require('./local_storage_model')


# Body Beast nutrition macro requirements to be extended
class BaseMacrosModel extends LocalStorageModel

    initialize: =>
        @fetch()

    increment: (macro, amt=1) =>
        @changeByAmount(macro, amt)

    decrement: (macro, amt=-1) =>
        @changeByAmount(macro, amt)

    changeByAmount: (macro, amt) =>
        macros = @get('macros')

        newCount = Math.max (macros[macro].count + parseFloat(amt)), 0
        macros[macro].count = newCount
        @save('macros', macros)

    getMacroPercentage: (macro) =>
        goal = @getGoalForMacro(macro)
        macro = @get('macros')[macro].count
        percentage = (macro / goal) * 100
        return Math.min(utils.roundFloat(percentage), 100)

    getGoalForMacro: (macro) =>
        @goals[macro]

    isExceedingGoal: (macro) =>
        goal = @getGoalForMacro(macro)
        macro = @get('macros')[macro].count
        return macro > goal

    clear: =>
        @save @defaults()
        @trigger('cleared')


module.exports = BaseMacrosModel
