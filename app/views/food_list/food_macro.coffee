View = require 'views/view'
BeastFoods = require 'models/foods/beast_foods'


class FoodMacroView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/food_macro')
    events:
        'click a': 'routeEvent'

    initialize: =>
        @model = new BeastFoods(@options.macro)

    getRenderData: =>
        @model.toJSON()


module.exports = FoodMacroView
