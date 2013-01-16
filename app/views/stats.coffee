View = require './view'
Stats = require 'models/stats'


class StatsView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/stats'
    events: {}

    initialize: =>
        @model = new Stats()

    getRenderData: =>
        @model.toJSON()


module.exports = StatsView
