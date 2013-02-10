View = require 'views/view'


class MealsView extends View
    tagName: 'div'
    className: 'content'
    template: require('views/templates/meals')
    events:
        'click a': 'routeEvent'
        'click .delete': 'deleteMeal'
        'click .eat': 'eatMeal'

    initialize: =>
        @collection.on('remove', @render)

    unbind: =>
        @collection.off('remove', @render)

    getRenderData: =>
        @collection.toJSON()

    deleteMeal: (event) =>
        id = $(event.currentTarget).parents('.list-item').data('id')
        meal = @collection.get(id)
        if meal?
            meal.destroy()

    eatMeal: (event) =>
        id = $(event.currentTarget).parents('.list-item').data('id')
        meal = @collection.get(id)
        if meal?
            @increment(meal)

        app.router.navigate '', {trigger: true}

    increment: (meal) =>
        for macro of @options.macros.toJSON()
            serving = meal.get(macro)
            app.macros.increment @options.macros.getMacro(macro), serving
        @


module.exports = MealsView
