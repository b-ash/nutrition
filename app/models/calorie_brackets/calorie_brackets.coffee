class CalorieBracketsFactory

    @getBracket: (stats) ->
        require("./#{stats.program}/#{stats.calories}c")


module.exports = CalorieBracketsFactory
