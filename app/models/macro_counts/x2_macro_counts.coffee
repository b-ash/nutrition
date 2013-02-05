BaseMacrosModel = require('./base_macros_model')


# X2 nutrition macro requirements
class X2Macros extends BaseMacrosModel

    defaults: ->
        macros:
            proteins:
                display: 'Proteins', count: 0
            dairy:
                display: 'Dairy', count: 0
            fruits:
                display: 'Fruits', count: 0
            veggies:
                display: 'Veggies', count: 0
            fats:
                display: 'Fats', count: 0
            grains:
                display: 'Grains', count: 0
            legumes:
                display: 'Legumes', count: 0
            condiments:
                display: 'Condiments', count: 0
        timestamp: new moment().format('MM-DD-YY')


module.exports = X2Macros
