View = require 'views/view'


class BeastConfigureView extends View
    tagName: 'div'
    className: 'extra-config'
    template: require 'views/templates/configure_beast'

    getRenderData: =>
        @model.toJSON()

    getInputData: =>
        {bfp: parseInt(@$('#bfp').val() or 0)}

    isValid: =>
        bfp = @$('#bfp').val()
        bfp.length isnt 0 and parseInt(bfp) isnt NaN


module.exports = BeastConfigureView
