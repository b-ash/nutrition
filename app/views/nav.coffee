app = require 'application'
View = require './view'
BeastMacros = require 'models/beast'


class NavView extends View
    el: '#nav'
    activeView: null
    events:
        'click a': 'routeEvent'
        'click #clear_list': 'clear'

    initialize: =>
        @on('routed', @updateActiveTab)

    updateActiveTab: =>
        @$('.nav li').removeClass('active')
        @$("##{@activeView}_nav").addClass('active')

    clear: =>
        app.model.clear()
        

module.exports = NavView
