View = require './view'
BeastFoods = require 'models/foods/beast_foods'


class FoodAllMacrosView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/food_all_macros'
    events:
        'click a': 'routeEvent'

    initialize: =>
        @model = new BeastFoods()

    getRenderData: =>
        @model.toJSON()


module.exports = FoodAllMacrosView
