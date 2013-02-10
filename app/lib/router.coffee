app = require 'application'
utils = require 'lib/utils'

Foods = require('models/foods/foods')
Meal = require('models/foods/meal')

NavView = require('views/nav')
views =
    index: require('views/index')
    stats: require('views/stats')
    help: require('views/help')
    about: require('views/about')
    configure: require('views/configuration/configure')
    foodAll:  require('views/food_list/food_all_macros')
    foodMacro: require('views/food_list/food_macro')
    food: require ('views/food_list/food')
    meals: require('views/food_list/meals')
    meal: require('views/food_list/meal')


module.exports = class Router extends Backbone.Router
    currentView: null
    routes:
        '': 'index'
        'food': 'foodAllMacros'
        'food/:macro': 'foodMacro'
        'food/:macro/:food': 'food'
        'meals': 'meals'
        'meals/define': 'mealDefine'
        'meals/:id': 'mealEdit'
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
        @setupView('food', 'foodAll', {model: @getFoods()})

    foodMacro: (macro) =>
        @setupView('food', 'foodMacro', {model: @getFoods(macro)})

    food: (macro, food) =>
        @setupView('food', 'food', {model: @getFoods(macro, food)})

    meals: =>
        @setupView('food', 'meals', {collection: app.meals, macros: @getFoods()})

    mealDefine: =>
        @setupView('food', 'meal', {model: new Meal(), collection: app.meals, macros: @getFoods()})

    mealEdit: (id) =>
        meal = app.meals.get(id)
        if meal?
            @setupView('food', 'meal', {model: meal, collection: app.meals, macros: @getFoods()})
        else
            @navigate '', {trigger: true}


    # Helpers
    getFoods: (macro, food) =>
        if macro? and food?
            new Foods(app.user, macro, food)
        else if macro?
            new Foods(app.user, macro)
        else
            new Foods(app.user)

    setupView: (navItem, claxx, params={}) =>
        if not app.user.isConfigured() and claxx isnt 'configure'
            return

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
        $('#main_page').html view.render().$el
