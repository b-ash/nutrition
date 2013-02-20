app = require 'application'
View = require 'views/view'
User = require 'models/users/user'

PROGRAM_CONFIG =
    beast: require('./beast_config')
    x2: require('./x2_config')


class ConfigureView extends View
    tagName: 'div'
    className: 'content'
    template: require 'views/templates/configure'
    events:
        'click #configure': 'configure'
        'change #program': 'renderProgramConfig'

    getRenderData: =>
        @model.toJSON()

    afterRender: =>
        program = @model.get('program')
        if program?
            @$("#program option[value='#{program}']").attr('selected', 'selected')
            @renderProgramConfig()

        theme = @model.get('theme')
        if theme
            @$("#theme option[value='#{theme}']").attr('selected', 'selected')

    renderProgramConfig: =>
        program = User.parseProgram @$('#program').val()
        if not program?
            @views.program?.remove()
            return

        @views.program = new PROGRAM_CONFIG[program] {model: @model}
        @$('#program_config').html @views.program.render().el

    isValid: =>
        name =  @$('#name').val()
        weight =   @$('#weight').val()
        program = @$('#program').val()

        name.length and
        program.length and
        weight.length and parseInt(weight) isnt NaN

    configure: =>
        unless @isValid() and (@views.program?.isValid())
            return @onError()

        config =
            name: @$('#name').val() or null
            weight: parseInt(@$('#weight').val() or 0)
            program: @$('#program').val()
            theme: @$('#theme').val()

        programConfig = @views.program.getInputData()

        @model.save $.extend({configured: true}, config, programConfig)
        app.onConfigure()
        app.router.navigate '', true

    onError: =>
        @$('#error_msg').show()

    onClose: =>
        @views.program.remove()
        delete @views.program
        

module.exports = ConfigureView
