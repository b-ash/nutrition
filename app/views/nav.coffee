app = require 'application'
View = require './view'


class NavView extends View
    el: '#nav'
    activeView: null
    events:
        'click a': 'routeEvent'
        'click #clear_list': 'clearMacros'
        'click #reset_user': 'resetUser'


    afterRender: =>
        @$('.nav li').removeClass('active')
        @$("##{@activeView}_nav").addClass('active')

    clearMacros: =>
        app.model.clear()

    resetUser: =>
        @clearMacros()
        # Reset user config
        # Navigate to /configure
        

module.exports = NavView
