View = require('views/view')
BeastFoods = require('models/foods/beast_foods')


class BaseMacroView extends View
    tagName: 'div'
    className: 'list-item macro'
    template: require('views/templates/macro_bar')
    events:
        'click .percentage-bar': 'increment'
        'click .btn-decrement': 'decrement'

    initialize: =>
        @model.on('cleared', @clear)

    onClose: =>
        @model.off('cleared', @clear)

    getRenderData: =>
        data = @model.get('macros')[@options.macro]

        macro: @options.macro
        count: data.count
        display: data.display

    increment: (event) =>
        event.stopPropagation()
        @model.increment(@options.macro)
        @animateRender()
        @trigger('update')

    decrement: (event) =>
        event.stopPropagation()
        @model.decrement(@options.macro)
        @animateRender()
        @trigger('update')

    animateRender: =>
        @changePercentBar()
        @changePercentText()
        @changeCurrentCals()

    changePercentBar: ($macro, macro) =>
        macroPercentage = @model.getMacroPercentage(@options.macro)
        pixelPercentage = macroPercentage / 100 * @$('.percentage-bar').width()
        @$('.percentage-complete').css {width: "#{pixelPercentage}px"}

    changePercentText: =>
        count = @model.get('macros')[@options.macro].count
        @$('.text_count').text count

        if @model.isExceedingGoal(@options.macro)
            @$('.percentage-text').addClass('exceeding')
        else
            @$('.percentage-text').removeClass('exceeding')

    changeCurrentCals: =>
        if @options.macro isnt 'shake'
            count = @model.get('macros')[@options.macro].count
            cals = new BeastFoods(@options.macro).get('cals')
            @$('.text_cals').text " - #{count * cals} cals"

    clear: =>
        @render()
        @trigger('update')


module.exports = BaseMacroView
