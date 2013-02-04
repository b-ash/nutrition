BaseMacrosModel = require('./base_macros_model')


# X2 nutrition macro requirements
class X2Macros extends BaseMacrosModel

    initialize: (stats) =>
        @id = "x2-#{stats.getCalories()}c"
        @goals = stats.getGoals()

        super

    defaults: ->
        macros:
            grains:
                display: 'Grains', count: 0
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
        timestamp: new moment().format('MM-DD-YY')


module.exports = X2Macros
