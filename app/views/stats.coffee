app = require 'application'
View = require './view'


class StatsView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/stats'

    getRenderData: =>
        user: app.user.toJSON()
        stats: @model.toJSON()


module.exports = StatsView
