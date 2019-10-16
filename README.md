Node Auth
=========================================
Node backend that is perfect for starting a project. ExpressJS, no Typescript for fast deployment.

We use token-based authentication. The userId is passed through the token. When the authMiddleware is enabled we check the token then extract the correct user from our MongoDB and attach it to the request. 

If you want to make auth truly stateless, you can encode all the User's detail in the token and pass it along. 

We're not going to do that because (1) To have secure logouts, you'll have to keep a record of tokens that are invalidated anyway (if a user logs out and an attacker steals the token, they can use it. We'll need to maintain state to know which tokens are invalid). We'd combine this with tokens naturally expiring so the database doesn't naturally explode in size, but this is still maintaining some state / doing a database query.

We're going to have that setup moving forward but we think it's too much for a starter - so we've provided this setup and later if anyone wants to change they can switch entirely to session based auth or implement a blacklist of tokens. The latter method, as described above, is described in depth here: https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6 

## Features

Auth: takes in firstName, lastName, username, email, password - you can change this easily!

DB Models: Setup to use MongoDB, you can easily create other models and pass it to models/index.js .

Middleware: Unlike other repos, we've setup the auth check AND server-side validation for you! Just pass it to your route like /signup or /login.

In app.js, we have one line for authMiddleware so you can apply it easily to sets of routes. You can easily comment it out to test routes without auth.

We use the dotenv library to pass secure keys and tokens and IDs and the like. We have a .env.example for you to refer to!

Winston logger is setup (along with bluebird for logging of all HTTP requests)! It's better for logging than console.log -> see more info here: https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications 

When using the logger, use it like this: 

import logger from '../util/logger' 
...
logger.silly("Hi")

More information in utils/logger.js

#### Happy hacking! Made with ❤️ from Ali.
