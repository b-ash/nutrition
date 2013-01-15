LocalStorageModel = require('./model')


# Body Beast nutrition macro requirements
class BeastMacros extends LocalStorageModel

    id: 'bodybeast-3000c'
    goals: ->
        starches: 8
        legumes: 4
        veggies: 7
        fruits: 7
        proteins: 14
        fats: 7
        shake: 1

    defaults: ->
        macros:
            starches:
                display: 'Starches', count: 0
            legumes:
                display: 'Legumes', count: 0
            veggies:
                display: 'Veggies', count: 0
            fruits:
                display: 'Fruits', count: 0
            proteins:
                display: 'Proteins', count: 0
            fats:
                display: 'Fats', count: 0
            shake:
                display: 'Shake', count: 0
        timestamp: new moment().format('MM-DD-YY')

    initialize: =>
        @fetch()

    increment: (key) =>
        macros = @get('macros')
        macros[key].count++
        @save('macros', macros)
        @trigger('incrememt', key)

    getMacroPercentage: (macro) =>
        goal = @goals()[macro]
        macro = @get('macros')[macro].count
        percentage = (macro / goal) * 100
        return Math.min(Math.round(percentage * 10) / 10, 100)

    getGoalForMacro: (macro) =>
        @goals()[macro]

    isExceedingGoal: (macro) =>
        goal = @getGoalForMacro(macro)
        macro = @get('macros')[macro].count
        return macro > goal

    clear: =>
        @save @defaults()
        @trigger('cleared')


module.exports = BeastMacros
