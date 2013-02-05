View = require 'views/view'


class X2ConfigureView extends View
    tagName: 'div'
    className: 'extra-config'
    template: require 'views/templates/configure_x2'

    getRenderData: =>
        @model.toJSON()

    afterRender: =>
        dab = @model.get('dab')
        if dab?
            @$("#dab option[value='#{dab}']").attr('selected', 'selected')

    getInputData: =>
        dab:  parseFloat(@$('#dab').val())
        de:   parseFloat(@$('#de').val())
        sway: parseFloat(@$('#sway').val())

    isValid: =>
        dab =  @$('#dab').val()
        de =   @$('#de').val()
        sway = @$('#sway').val()

        dab.length  and parseFloat(dab)  isnt NaN and
        de.length   and parseFloat(de)   isnt NaN and
        sway.length and parseFloat(sway) isnt NaN


module.exports = X2ConfigureView
