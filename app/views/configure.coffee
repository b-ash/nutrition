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
        @$("#phase option[value=#{@model.get('phase')}]").attr('selected', 'selected')

    configure: =>
        name   = @$('#name').val()   or null
        weight = @$('#weight').val() or 0
        bfp    = @$('#bfp').val()    or 0
        phase  = @$('#phase').val()

        @model.save 
            name: name
            weight: parseInt(weight)
            bfp: parseInt(bfp)
            phase: phase
            configured: true

        app.onConfigure()
        app.afterConfiguration()
        app.router.navigate '', true
        

module.exports = ConfigureView
