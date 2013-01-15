BeastMacros = require 'models/beast'

Application =
    initialize: (onSuccess) ->
        Router = require 'lib/router'

        @views = {}
        @router = new Router()
        @model = new BeastMacros()
        Backbone.history.start
            pushState: true

        onSuccess()
    

module.exports = Application
