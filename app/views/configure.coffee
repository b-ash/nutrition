app = require 'application'
View = require './view'


class ConfigureView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/configure'
    events:
        'click #configure': 'configure'

    getRenderData: =>
        @model.toJSON()

    afterRender: =>
        @$("#program option[value='#{@model.get('program')}']").attr('selected', 'selected')

    configure: =>
        name   = @$('#name').val()   or null
        weight = @$('#weight').val() or 0
        bfp    = @$('#bfp').val()    or 0
        program  = @$('#program').val()

        if not program.length
            return @onError()

        @model.save 
            name: name
            weight: parseInt(weight)
            bfp: parseInt(bfp)
            program: program
            configured: true

        app.onConfigure()
        app.afterConfiguration()
        app.router.navigate '', true

    onError: =>
        @$('#error_msg').show()
        

module.exports = ConfigureView
