LocalStorageModel = require('models/local_storage_model')

# Body Beast Use Configuration
class BeastUserConfig extends LocalStorageModel
    id: 'user'

    initialize: =>
        @fetch()

    defaults: ->
        name: null
        weight: null
        bfp: null
        phase: 'build'
        configured: false


module.exports = BeastUserConfig
