View = require './view'
Foods = require 'models/foods'


class FoodMacroView extends View
    tagName: 'div'
    className: '.content'
    template: require './templates/food_macro'
    events:
        'click a': 'routeEvent'

    initialize: =>
        @model = new Foods(@options.macro)

    getRenderData: =>
        @model.toJSON()


module.exports = FoodMacroView
