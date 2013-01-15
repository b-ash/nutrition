class Foods

    legumes:
        display: 'Legumes'
        cals: 125
        foods: [
            {display: 'Beans', portion: 0.5, measurement: 'cup'}
            {display: 'Refried Beans', portion: 0.5, measurement: 'cup'}
            {display: 'Fava (cooked)', portion: 0.66, measurement: 'cup'}
            {display: 'Lentils', portion: 0.5, measurement: 'cup'}
            {display: 'Peas', portion: 0.5, measurement: 'cup'}
        ]

    constructor: (@macro) ->

    toJSON: =>
        this[@macro] or {}


module.exports = Foods
