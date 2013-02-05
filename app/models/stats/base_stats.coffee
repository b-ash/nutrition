CalorieBrackets = require('models/calorie_brackets/calorie_brackets')


class BaseStats

    getGoals: =>
        goals = CalorieBrackets.getBracket(@)
        goals.goals

    getCalories: =>
        @calorieBracket.cals

    toJSON: ->
        stats: @getDisplayStats()


module.exports = BaseStats
