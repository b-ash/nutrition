utils = require('lib/utils')
LocalStorageModel = require('./local_storage_model')


# Body Beast nutrition macro requirements to be extended
class BaseMacrosModel extends LocalStorageModel

    initialize: =>
        @fetch()

    increment: (key, amt=1) =>
        macros = @get('macros')
        macros[key].count += parseFloat(amt)
        @save('macros', macros)
        @trigger('incrememt', key)

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
