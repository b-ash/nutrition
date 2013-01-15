utils = require 'lib/utils'
app = require 'application'
require 'lib/view_helper'


# Base class for all views.
module.exports = class View extends Backbone.View
    views: {}

    template: ->
        return

    getRenderData: ->
        return

    getPartialsRenderData: ->
        {}

    render: =>
        @$el.html @template @getRenderData(), {partials: @getPartialsRenderData()}
        @afterRender()
        @

    afterRender: ->
        return

    close: =>
        @remove()
        @unbind()
        @onClose?()

    routeEvent: (event) =>
        $link = $ event.target
        url = $link.attr('href')

        if $link.attr('target') is '_blank' or 
           typeof url is 'undefined' or 
           url.substr(0, 4) is 'http' or 
           url is '' or 
           url is 'javascript:void(0)'
            return true 

        event.preventDefault()

        if $link.hasClass('dont-route')
            return true
        else
            @routeLink url

    routeLink: (url) =>
        app.router.navigate url, {trigger: true}
        @trigger('routed')
