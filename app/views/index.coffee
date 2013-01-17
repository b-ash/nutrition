View = require './view'


class IndexView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/index'
    events: 
        'click .percentage-bar': 'increment'
        'click .btn-reset': 'resetMacro'

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
        $percentageText = $macro.find('.percentage-text')
        $completionBar = $macro.find('.percentage-complete')

        macroPercentage = @model.getMacroPercentage(macro)
        pixelPercentage = macroPercentage / 100 * $totalBar.width()

        $currentCount.text @model.get('macros')[macro].count
        $completionBar.css {width: "#{pixelPercentage}px"}

        if @model.isExceedingGoal(macro)
            $percentageText.addClass('exceeding')
        else
            $percentageText.removeClass('exceeding')

    onClose: =>
        @model.off('cleared', @render)


module.exports = IndexView
