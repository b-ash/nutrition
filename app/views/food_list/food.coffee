app = require 'application'
View = require 'views/view'
BaseFoods = require 'models/foods/base_foods'


class FoodMacroView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/food')
    events:
        'click a': 'routeEvent'
        'click #submit_and_route': 'submitAndRoute'
        'click #submit_and_go_home': 'submitAndGoHome'

    getRenderData: =>
        @model.toJSON()

    increment: =>
        servingSize = @$('#portion_select').val()
        modelData = @model.toJSON()
        macro = modelData.macroOverride or modelData.macro
        app.macros.increment(macro, servingSize)

    submitAndRoute: =>
        @increment()
        app.router.navigate("/food", true)

    submitAndGoHome: =>
        @increment()
        app.router.navigate('', true)


module.exports = FoodMacroView
