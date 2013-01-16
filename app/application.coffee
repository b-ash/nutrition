BeastMacros = require 'models/beast_macro_counts'
BeastUser = require 'models/beast_user'


Application =
    initialize: (onSuccess) ->
        Router = require 'lib/router'

        @views = {}
        @router = new Router()
        #@model = new BeastMacros()
        @user = new BeastUser()
        Backbone.history.start
            pushState: true

        onSuccess()
    

module.exports = Application
