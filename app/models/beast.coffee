LocalStorageModel = require('./model')


# Body Beast nutrition macro requirements
class BeastMacros extends LocalStorageModel

    goals: ->
        starches: [7, 8]
        legugumes: 4
        veggies: [6, 7]
        fruits: 7
        proteins: [13, 14]
        fats: [6, 7]
        shake: 1

    defaults: ->
        starches: 0
        legugumes: 0
        veggies: 0
        fruits: 0
        proteins: 0
        fats: 0
        shake: 0

    initialize: =>
        

module.exports = BeastMacros
