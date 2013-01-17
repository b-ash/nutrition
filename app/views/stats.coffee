app = require 'application'
View = require './view'
Stats = require 'models/stats'


class StatsView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/stats'
    events: {}

    getRenderData: =>
        user: app.user.toJSON()
        stats: @model.toJSON()


module.exports = StatsView
