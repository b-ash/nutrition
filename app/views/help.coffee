View = require './view'


class HelpView extends View
    tagName: 'div'
    className: 'content'
    template: require './templates/help'
        

module.exports = HelpView
