View = require './view'


class IndexView extends View
    tagName: 'div'
    className: '.content'
    template: require './templates/index'
    events: 
        'click .percentage-bar': 'increment'

    initialize: =>
        @model.on('cleared', @render)

    getRenderData: =>
        @model.toJSON()

    increment: (event) =>
        # TODO: make each macro a view
        $totalBar = $(event.currentTarget)
        macro = $totalBar.parents('.macro').attr('data-key')
        @model.increment(macro)

        macroPercentage = @model.getMacroPercentage(macro)
        pixelPercentage = macroPercentage / 100 * 300

        $currentCount = $totalBar.find('#text_count')
        $percentageText = $totalBar.find('.percentage-text')
        $completionBar = $totalBar.find('.percentage-complete')

        $currentCount.text(@model.get('macros')[macro].count)
        $completionBar.css {width: "#{pixelPercentage}px"}

        if @model.isExceedingGoal(macro)
            $percentageText.addClass('exceeding')


module.exports = IndexView
