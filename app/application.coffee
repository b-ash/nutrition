BeastUser = require 'models/beast_user'
BeastMacros = require 'models/beast_macro_counts'
Stats = require 'models/stats'


Application =
    initialize: (onSuccess) ->
        Router = require 'lib/router'

        @views = {}
        @router = new Router()
        @user = new BeastUser()

        if @user.get('configured')
            @afterConfiguration()
        else if window.location.pathname isnt '/configure'
            return window.location.href = '/configure'

        Backbone.history.start
            pushState: true

        onSuccess()

    onConfigure: ->
        @macros?.destroy()

    afterConfiguration: ->
        @stats = new Stats @user
        @macros = new BeastMacros @stats, @user
    

module.exports = Application
