View = require 'views/view'
BaseFoods = require 'models/foods/base_foods'


class FoodMacroView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/food_macro')
    events:
        'click a': 'routeEvent'

    getRenderData: =>
        @model.toJSON()


module.exports = FoodMacroView
