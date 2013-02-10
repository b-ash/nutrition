Meal = require('models/foods/meal')


class Meals extends Backbone.Collection

    model: Meal
    localStorage: new Backbone.LocalStorage('meals')

    initialize: =>
        @fetch()

    destroy: =>
        while (@length > 0)
            @first().destroy()
        @


module.exports = Meals
