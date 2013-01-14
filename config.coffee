exports.config =
    paths:
        public: 'public'

    files:
        javascripts:
            defaultExtension: 'coffee'
            joinTo:
                'static/js/app.js': /^app/
                'static/js/vendor.js': /^vendor/
            order:
                before: [
                    'vendor/scripts/console-helper.js'
                    'vendor/scripts/jquery.js'
                    'vendor/scripts/jquery-ui-1.8.20.js'
                    'vendor/scripts/jquery.blockui.js'
                    'vendor/scripts/jquery.scrollpanel.js'
                    'vendor/scripts/underscore.js'
                    'vendor/scripts/backbone.js'
                    'vendor/scripts/backbone.localStorage.js'
                    'vendor/scripts/chosen.jquery.js'
                    'vendor/scripts/moment.js'
                ]

        stylesheets:
            defaultExtension: 'styl'
            joinTo: 'static/css/app.css'
            order:
                before: [
                    'vendor/styles/normalize.css'
                    'vendor/styles/jquery-ui-1.8.20.css'
                    'vendor/styles/chosen.css'
                    'vendor/styles/bootstrap.css'
                ]
                after: ['vendor/styles/helpers.css']

        templates:
            defaultExtension: 'hbs'
            joinTo: 'static/js/app.js'

    minify: no

    server:
        path: 'server.coffee'
        port: 3333
        base: ''
