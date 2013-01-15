app = require 'application'
View = require './view'


class NavView extends View
    el: '#nav'
    activeView: null
    events:
        'click a': 'routeEvent'
        'click #clear_list': 'clear'

    afterRender: =>
        @$('.nav li').removeClass('active')
        @$("##{@activeView}_nav").addClass('active')

    clear: =>
        app.model.clear()
        

module.exports = NavView
