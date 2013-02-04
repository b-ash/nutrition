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
        configured: false

    getPhase: ->
        program = @get('program')
        if not program?
            return ''
        
        slash = program.indexOf('/')
        if slash is -1
            return ''

        return program.substring(slash+1, program.length)

    getProgram: ->
        program = @get('program')
        if not program?
            return ''
        else if program.indexOf('beast') is 0
            return 'beast'
        else if program.indexOf('x2') is 0
            return 'x2'
        else
            return program

    isConfigured: ->
        @get('configured') and @get('program')? and @get('program').length


module.exports = User
