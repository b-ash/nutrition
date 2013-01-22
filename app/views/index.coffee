View = require './view'
BeastFoods = require 'models/foods/beast_foods'


class IndexView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/index'
    events: 
        'click .percentage-bar': 'increment'
        'click .btn-decrement': 'resetMacro'

    initialize: =>
        @model.on('cleared', @render)

    getRenderData: =>
        @model.toJSON()

    increment: (event) =>
        event.stopPropagation()
        $macro = $(event.currentTarget).parents('.macro')
        macro = $macro.attr('data-key')

        @model.increment(macro)
        @changePercentBar($macro, macro)

    resetMacro: (event) =>
        event.stopPropagation()
        $macro = $(event.currentTarget).parents('.macro')
        macro = $macro.attr('data-key')

        @model.decrement(macro)
        @changePercentBar($macro, macro)

    changePercentBar: ($macro, macro) =>
        $totalBar = $macro.find('.percentage-bar')
        $currentCount = $macro.find('.text_count')
        $currentCals = $macro.find('.text_cals')
        $currentTotalCals = @$('#text_total_cals')
        $percentageText = $macro.find('.percentage-text')
        $completionBar = $macro.find('.percentage-complete')

        macroPercentage = @model.getMacroPercentage(macro)
        pixelPercentage = macroPercentage / 100 * $totalBar.width()

        count = @model.get('macros')[macro].count
        $currentCount.text count

        if macro isnt 'shake'
            cals = new BeastFoods(macro).get('cals')
            $currentCals.text " - #{count * cals} cals"
            $currentTotalCals.text @model.getTotalCals()

        $completionBar.css {width: "#{pixelPercentage}px"}

        if @model.isExceedingGoal(macro)
            $percentageText.addClass('exceeding')
        else
            $percentageText.removeClass('exceeding')

    onClose: =>
        @model.off('cleared', @render)


module.exports = IndexView
