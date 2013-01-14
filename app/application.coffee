Application =
    initialize: (onSuccess) ->
        Router = require 'lib/router'

        @views = {}
        @router = new Router()
        Backbone.history.start
            pushState: true

        onSuccess()
    

module.exports = Application
