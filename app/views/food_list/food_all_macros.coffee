View = require 'views/view'
BaseFoods = require 'models/foods/base_foods'


class FoodAllMacrosView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/food_all_macros')
    events:
        'click a': 'routeEvent'

    getRenderData: =>
        @model.toJSON()


module.exports = FoodAllMacrosView
