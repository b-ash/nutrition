STATS =
    beast: require('./beast_stats')
    x2: require('./x2_stats')

class StatsFactory
    
    @getStats: (user) ->
        if user.isConfigured()
            return new STATS[user.getProgram()](user)


module.exports = StatsFactory
