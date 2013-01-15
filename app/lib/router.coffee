app = require 'application'
utils = require 'lib/utils'

NavView = require('views/nav')
views =
    index: require('views/index')
    stats: require('views/stats')


module.exports = class Router extends Backbone.Router
    currentView: null
    routes:
        '': 'index'
        'stats': 'stats'
        '*query': 'redirectDefault'

    redirectDefault: (actions) =>
        @navigate '', {trigger: true}

    index: =>
        @setupView('index', 'index', {model: app.model})

    stats: =>
        @setupView('stats', 'stats', {model: app.model})

    setupView: (navItem, claxx, params={}) =>
        @navSetup(navItem)
        view = app.views[claxx]
        if view isnt @currentView
            @closeCurrentView()
            view = app.views[claxx] = new views[claxx](params)
            @setCurrentView view

    navSetup: (activeView) =>
        if not app.views.nav?
            app.views.nav = new NavView()
        app.views.nav.activeView = activeView
        app.views.nav.render()

    closeCurrentView: =>
        @currentView?.close()

    setCurrentView: (view) =>
        @currentView = view
        $('#main_page').append view.render().$el
