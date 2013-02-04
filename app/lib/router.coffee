app = require 'application'
utils = require 'lib/utils'

Foods = require('models/foods/base_foods')

NavView = require('views/nav')
views =
    index: require('views/index')
    stats: require('views/stats')
    help: require('views/help')
    about: require('views/about')
    configure: require('views/configure')
    foodAll:  require('views/food_list/food_all_macros')
    foodMacro: require('views/food_list/food_macro')
    food: require ('views/food_list/food')


module.exports = class Router extends Backbone.Router
    currentView: null
    routes:
        '': 'index'
        'food': 'foodAllMacros'
        'food/:macro': 'foodMacro'
        'food/:macro/:food': 'food'
        'stats': 'stats'
        'help': 'help'
        'about': 'about'
        'configure': 'configure'
        '*query': 'redirectDefault'

    redirectDefault: (actions) =>
        @navigate '', {trigger: true}

    index: =>
        @setupView('index', 'index', {model: app.macros})

    stats: =>
        @setupView('stats', 'stats', {model: app.stats})

    help: =>
        @setupView('settings', 'help')

    about: =>
        @setupView('settings', 'about')

    configure: =>
        @setupView('settings', 'configure', {model: app.user})

    foodAllMacros: =>
        @setupView('food', 'foodAll', {model: new Foods()})

    foodMacro: (macro) =>
        @setupView('food', 'foodMacro', {model: new Foods(app.program, macro)})

    food: (macro, food) =>
        @setupView('food', 'food', {model: new Foods(app.program, macro, food)})

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
