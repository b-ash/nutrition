BaseMacrosModel = require('./base_macros_model')


# Body Beast nutrition macro requirements
class BeastMacros extends BaseMacrosModel

    initialize: (stats) =>
        @id = "bodybeast-#{stats.getCalories()}c"
        @goals = stats.getGoals()

        super

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


module.exports = BeastMacros
