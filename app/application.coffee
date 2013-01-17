BeastUser = require 'models/beast_user'
BeastMacros = require 'models/beast_macro_counts'
Stats = require 'models/stats'


Application =
    initialize: (onSuccess) ->
        Router = require 'lib/router'

        @views = {}
        @router = new Router()
        @user = new BeastUser()

        if not @user.get('configured') and window.location.pathname isnt '/configure'
            window.location.href = '/configure'
        else
            @afterConfiguration()
            
            Backbone.history.start
                pushState: true

            onSuccess()

    onConfigure: ->
        @afterConfiguration()
        @macros.destroy()
        @macros = new BeastMacros @stats, @user

    afterConfiguration: ->
        @stats = new Stats @user
        @macros = new BeastMacros @stats, @user
    

module.exports = Application
