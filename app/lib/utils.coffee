String.prototype.capitalize = ->
    this.charAt(0).toUpperCase() + this.slice(1)

String.prototype.toDisplay = ->
    this.replace('_', ' ').capitalize()


module.exports =
    roundFloat: (percentage, precision=100) ->
        Math.round(percentage * precision) / precision

    pluralize: (word, quantity) ->
        if quantity > 1
            return "#{word}s"
        else
            return word

    formatTheme: (user) ->
        if user.get('theme') is 'dark'
            classMethod = 'add'
        else
            classMethod = 'remove'

        $('html')["#{classMethod}Class"]('dark')
        $('#nav')["#{classMethod}Class"]('navbar-inverse')
