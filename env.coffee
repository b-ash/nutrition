envs =
    production: 
        domain: (String) process.env.PROD_DOMAIN
        port: (Number) process.env.PROD_PORT
        db: (String) process.env.PROD_DB
        user: (String) process.env.PROD_USER
        pass: (String) process.env.PROD_PASS

    local_nutrition:
        domain: (String) process.env.NUTRITION_PROD_DOMAIN
        port: (Number) process.env.NUTRITION_PROD_PORT
        db: (String) process.env.NUTRITION_PROD_DB
        user: (String) process.env.NUTRITION_PROD_USER
        pass: (String) process.env.NUTRITION_PROD_PASS

# Control creds by env variables
env = (String) process.env.NODE_ENV
if not env? then env = 'local_nutrition'

module.exports = envs[env]
