User = require 'models/users/user'
MacroCountsFactory = require 'models/macro_counts/macro_counts_factory'
StatsFactory = require 'models/stats/stats_factory'


Application =
    initialize: (onSuccess) ->
        Router = require 'lib/router'

        @views = {}
        @router = new Router()
        @user = new User()

        if not @user.isConfigured() and window.location.pathname isnt '/configure'
            window.location.href = '/configure'
        else
            @afterConfiguration()
            
            Backbone.history.start
                pushState: true

            onSuccess()

    onConfigure: ->
        @macros.destroy()
        @stats = StatsFactory.getStats @user
        @macros = MacroCountsFactory.getMacroCounts @user, @stats

    afterConfiguration: ->
        if @user.isConfigured()
            @stats = StatsFactory.getStats @user
            @macros = MacroCountsFactory.getMacroCounts @user, @stats
    

module.exports = Application
