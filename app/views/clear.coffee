View = require './view'


class ClearView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/clear'
    events:
        'click #clear_app': 'clearApp'

    clearApp: =>
        localStorage.clear()
        window.location.reload(true)
        

module.exports = ClearView
