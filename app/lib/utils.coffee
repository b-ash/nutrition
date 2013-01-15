module.exports =
    roundFloat: (percentage) ->
        Math.round(percentage * 10) / 10

    pluralize: (word, quantity) ->
        if quantity > 1
            return "#{word}s"
        else
            return word
