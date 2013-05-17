fs = require 'fs'
express = require 'express'
sysPath = require 'path'

#fullPath = sysPath.resolve './config'
{config} = require './config'

exports.startServer = (port, path, callback) ->
    app = express express.logger()
    port = parseInt(process.env.PORT or port, 10)

    # Express init
    app.configure ->
        app.use express.bodyParser()
        app.use express.methodOverride()
        app.use express.errorHandler
            dumpExceptions: true
            showStack: true

    # Serve our static assets
    app.use express.static("#{__dirname}/#{path}")

    # Since everything is client side, we only serve index.html
    app.get "*", (req, res) ->
        res.sendfile "#{__dirname}/#{path}/index.html"

    # Serve it up!
    app.listen port, -> 
        console.info "Listening on #{port}, dawg"
    app

# We only start this up if we're not using brunch to run it. Pretty hacky, I know.
exports.startServer config.server.port, config.paths.public unless config.server.run?
