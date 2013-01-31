BaseBar = require('models/macro_bars/base_macro_bar')

OVERRIDES =
    shake: BaseBar

class MacroBarFactory

    @get: (macro) ->
        OVERRIDES[macro] or BaseBar


module.exports = MacroBarFactory
