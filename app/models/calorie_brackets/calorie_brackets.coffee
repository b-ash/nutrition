class CalorieBrackets

    @getBracket: (stats) ->
        require("./#{stats.program}/#{stats.phase}/#{stats.calories}c")


module.exports = CalorieBrackets
