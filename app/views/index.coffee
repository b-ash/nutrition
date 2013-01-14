View = require './view'
BeastMacros = require 'models/beast'

class IndexView extends View
    el: '.main-page'
    template: require './templates/index'
    events: {}
    dom: {}

    initialize: =>
        @model = new BeastMacros()

    getRenderData: =>
        {macros: @model.toJSON()}


module.exports = IndexView
