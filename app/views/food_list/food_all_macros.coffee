View = require 'views/view'


class FoodAllMacrosView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/food_all_macros')
    events:
        'click a': 'routeEvent'

    getRenderData: =>
        @model.toJSON()


module.exports = FoodAllMacrosView
