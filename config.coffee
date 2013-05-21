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
                    'vendor/scripts/underscore.js'
                    'vendor/scripts/backbone.js'
                    'vendor/scripts/backbone.localStorage.js'
                    'vendor/scripts/moment.js'
                ]

        stylesheets:
            defaultExtension: 'styl'
            joinTo: 'static/css/app.css'
            order:
                before: [
                    'vendor/styles/normalize.css'
                    'vendor/styles/jquery-ui-1.8.20.css'
                    'vendor/styles/bootstrap.css'
                ]

        templates:
            defaultExtension: 'hbs'
            joinTo: 'static/js/app.js'

    minify: no

    server:
        path: 'app.coffee'
        port: 3000
        base: ''
