app = require 'application'
utils = require 'lib/utils'

IndexView = require 'views/index'


module.exports = class Router extends Backbone.Router
    routes:
        '*query': 'index'

    index: =>
        app.views.indexView = new IndexView()
        app.views.indexView.render()
