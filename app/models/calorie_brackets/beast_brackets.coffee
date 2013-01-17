class BeastCalorieBrackets

    @getBracket: (calories, phase) ->
        require("./beast/#{phase}/#{calories}c")


module.exports = BeastCalorieBrackets
