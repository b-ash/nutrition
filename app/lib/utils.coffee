module.exports =
    roundFloat: (percentage) ->
        Math.round(percentage * 100) / 100

    pluralize: (word, quantity) ->
        if quantity > 1
            return "#{word}s"
        else
            return word
