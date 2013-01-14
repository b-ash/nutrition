mongo = require 'mongodb'
Server = mongo.Server 
Db = mongo.Db 
ObjectId = mongo.BSONPure.ObjectID

env = require './env'


class Api
    init: (app) =>
        console.log "Connecting to mongo with #{JSON.stringify env}"

        @server = new Server env.domain, env.port, {}
        @db = new Db env.db, @server 

        @db.open (err, db) =>
            if err
                console.error 'Couldnt connect to mongo.'
                throw err 
            console.log 'Connected to mongo.'

            @db.authenticate env.user, env.pass, (err, replies) =>
                if err 
                    console.error 'Couldnt authenticate to mongo.'
                    throw err 
                console.log 'Authenticated to mongo'
                @collections().serve app
        @

    collections: =>
        @db.createCollection 'emails', (err, col) =>
            if err? then throw err
            @emails = col
            @emails.ensureIndex {email: 1}, {unique: true}
        @

    getEmails: (req, res, next) =>
        console.log 'Getting emails'

        @emails.find().toArray (err, items) ->
            console.log items.length
            res.send items

    postEmail: (req, res, next) =>
        console.log 'Sending email'
        params = req.body

        # Add {safe: true} if we want to throw errors
        @emails.insert params, (err, item) =>
            if err?
                console.log 'Issue saving...'
                throw err
        res.send params

    clear: (req, res, next) =>
        @emails.remove {}, {safe: true}, (err, result) ->
            if err?
                res.send {result: 'failure'}
            else
                res.send {result: 'success', count: result}

    serve: (app) =>
        # app.get '/api/v1/emails', @getEmails
        # app.post '/api/v1/create', @postEmail
        # app.get '/api/v1/clear', @clear


module.exports = Api
