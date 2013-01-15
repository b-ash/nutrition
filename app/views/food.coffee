app = require 'application'
View = require './view'
BeastFoods = require 'models/foods/beast_foods'


class FoodMacroView extends View
    tagName: 'div'
    className: '.content'
    template: require './templates/food'
    events:
        'click a': 'routeEvent'
        'click #submit_and_route': 'submitAndRoute'
        'click #submit_and_go_home': 'submitAndGoHome'

    initialize: =>
        @model = new BeastFoods(@options.macro, @options.food)

    getRenderData: =>
        @model.toJSON()

    increment: =>
        servingSize = @$('#portion_select').val()
        modelData = @model.toJSON()
        macro = modelData.macroOverride or modelData.macro
        app.model.increment(macro, servingSize)

    submitAndRoute: =>
        @increment()
        app.router.navigate("/food/#{@options.macro}", true)

    submitAndGoHome: =>
        @increment()
        app.router.navigate('', true)


module.exports = FoodMacroView
