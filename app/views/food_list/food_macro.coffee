View = require 'views/view'


class FoodMacroView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/food_macro')
    events:
        'click a': 'routeEvent'

    getRenderData: =>
        @model.toJSON()


module.exports = FoodMacroView
