MACRO_COUNTS =
    beast: require('./beast_macro_counts')
    x2: require('./x2_macro_counts')


class MacroCountsFactory

    @getMacroCounts: (user, stats) ->
        return new MACRO_COUNTS[user.getProgram()](stats)


module.exports = MacroCountsFactory
