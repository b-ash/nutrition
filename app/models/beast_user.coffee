LocalStorageModel = require('./local_storage_model')
Stats = require('./stats')


# Body Beast Use Configuration
class BeastUserConfig extends LocalStorageModel

    id: 'user'

    initialize: =>
        @fetch()

    goals: ->
        starches: 8
        legumes: 4
        veggies: 7
        fruits: 7
        proteins: 14
        fats: 7
        shake: 1

    defaults: ->
        name: 'Unknown'
        weight: 150
        bfp: 15
        phase: 'build'
        configured: false

    buildStats: =>
        @stats = new Stats(@weight, @bfp, @phase)


module.exports = BeastUserConfig
