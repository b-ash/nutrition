User = require 'models/users/user'
Meals = require 'models/foods/meals'
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
        @macros?.destroy()
        @meals?.destroy()
        @stats = StatsFactory.getStats @user
        @macros = MacroCountsFactory.getMacroCounts @user, @stats
        @meals = new Meals()

    afterConfiguration: ->
        if @user.isConfigured()
            @stats = StatsFactory.getStats @user
            @macros = MacroCountsFactory.getMacroCounts @user, @stats
            @meals = new Meals()
    

module.exports = Application
