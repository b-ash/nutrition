View = require './view'
MacroBarFactory = require('views/macro_bars/macro_bar_factory')


class IndexView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/index'

    initialize: =>
        for macro of @model.get('macros')
            claxx = new MacroBarFactory.get(macro)
            view = new claxx {model: @model, macro}
            view.on('update', @updateTotalCalories)
            @views[macro] = view

    getRenderData: =>
        @model.toJSON()

    afterRender: =>
        @$('.list.macros').append(view.render().el) for macro, view of @views

    updateTotalCalories: =>
        @$('#text_total_cals').text @model.getTotalCals()


module.exports = IndexView
