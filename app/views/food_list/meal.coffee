View = require 'views/view'


class MealView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/meal')
    events:
        'click a': 'routeEvent'
        'click #submit_and_route': 'submitAndRoute'
        'click #submit_and_go_home': 'submitAndGoHome'

    getRenderData: =>
        meal: @model.toJSON()
        macros: @options.macros.toJSON()

    afterRender: =>
        if not @model.get('name')
            return

        @$('option').removeAttr('selected')
        for macro, display of @options.macros.toJSON()
            @$("##{macro}.serving option[value='#{@model.get(macro) or 0}']").attr('selected', 'selected')
        @

    submitAndRoute: =>
        if @save()
            app.router.navigate("/meals", true)

    submitAndGoHome: =>
        if @save()
            app.router.navigate('', true)

    save: =>
        if not @isValid()
            return @onError()

        @model.set
            name: @$('#name').val()
            description: @$('#description').val()

        for macro, display of @options.macros.toJSON()
            @model.set macro, parseFloat(@$("##{macro}.serving").val())

        if @model.get('id')?
            @model.save()
        else
            @collection.create @model

        return true

    isValid: =>
        @$('#name').val().length

    onError: =>
        @$('#error_msg').show()
        $('body').scrollTop 0
        return false


module.exports = MealView
