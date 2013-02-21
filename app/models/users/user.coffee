LocalStorageModel = require('models/local_storage_model')


class User extends LocalStorageModel
    id: 'user'

    initialize: =>
        @fetch()

    defaults: ->
        name: null
        weight: null
        bfp: null
        program: null
        theme: 'light'
        configured: false

    getPhase: ->
        program = @get('program')
        if not program?
            return null
        
        slash = program.indexOf('/')
        if slash is -1
            return null

        return program.substring(slash+1, program.length)

    getProgram: ->
        program = @get('program')
        User.parseProgram(program)

    hasProgramChanged: (program) ->
        User.parseProgram(program) isnt @getProgram()

    isConfigured: ->
        @get('configured') and @get('program')? and @get('program').length

    @parseProgram: (program) ->
        if not program? or program.length is 0
            return null
        else if program.indexOf('beast') is 0
            return 'beast'
        else if program.indexOf('x2') is 0
            return 'x2'
        else
            return program


module.exports = User
