Node Auth
=========================================

Node backend with authentication that is perfect for starting a project. ExpressJS, no Typescript for fast startup.

Add tasks, questions, or suggestions to for what you'd like to see in this repo here 🙂: https://www.notion.so/simplata/ad0519b44ae247c98af93afe597106b5?v=1187a31723df456ba6277e543a0f0cd0

If there's an issue on the repo with the code as is, create an issue on the repo!

## Starting up

1) First create a .env file using .env.example. 

This file contains sensitive information that should never be committed to your git repository. We have modified .gitignore so this doesn't happen.

2) Run with the following commands.

```
npm install
```

The above installs all third-party packages that you are accessing through the node package manager. The below is a script that uses nodemon, which restarts your server whenever you make changes to your backend.

```
npm run dev
```

## Authentication note

We use token-based authentication. When signing up or logging in, we pass a token that needs to be saved by the client. You can see this by using Postman and examining the src/routes/auth file. 

We enable authMiddleware in app.js on certain routes to check the token. If this is indeed the user who is sending the request with the token, we extract the correct user from our MongoDB and attach it to the request under req.user.

On the client, all you need to do when logging in or signing in is store the token in localStorage. I would suggest the following code be used (this is in React and using the axios package, adjust for whatever client you decide to use):

```
// To store the token on logging in or signing up
window.localStorage.setItem("token", this.token);

...

let api_inst = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    timeout: 2000,
    headers: {'Content-Type': 'application/json'}
});

// when sending requests from the client, create the following header
api_inst.interceptors.request.use((config) => {
    if (userStore.token) { config.headers.Authorization = `bearer ${window.localStorage.getItem("token")}` }
    return config;
});
...
```

### Auth Design Upgrades

Now if you want to make auth truly stateless, you can encode all the User's detail in the token and pass it along. 

We're not going to do that because (1) To have secure logouts, you'll have to keep a record of tokens that are invalidated anyway (if a user logs out and an attacker steals the token, they can use it. We'll need to maintain state to know which tokens are invalid). We'd combine this with tokens naturally expiring so the database doesn't naturally explode in size, but this is still maintaining some state / doing a database query.

We're going to have that setup moving forward but we think it's too much for a starter - so we've provided this setup and later if anyone wants to change they can switch entirely to session based auth or implement a blacklist of tokens. The latter method, as described above, is described in depth here: https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6 

## Features

Auth: takes in firstName, lastName, username, email, password!

DB Models: Setup to use MongoDB, you can easily create other models and pass it to models/index.js .

Middleware: Unlike other repos, we've setup the auth check after logging in AND server-side validation for login and signup inputs!

In app.js, we have one line for authMiddleware so you can apply it easily to sets of routes. You can easily comment it out to test routes without sending an authentication token.

We use the dotenv library to pass sensitive information like IDs and secret tokens. We have a .env.example for you to refer to!

Winston logger is setup (along with bluebird for logging of all HTTP requests)! It's better for logging than console.log -> see more info in the src/util/logger file. For even more info see this article: https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications 

When using the logger, use it like this: 

```
import logger from '../util/logger' 
...
logger.silly("Hi")
```

Again, add tasks, questions, or suggestions to for what you'd like to see in this repo here 🙂: https://www.notion.so/simplata/ad0519b44ae247c98af93afe597106b5?v=1187a31723df456ba6277e543a0f0cd0

If there's an issue on the repo with the code as is, create an issue on the repo!

#### Happy hacking! Made with ❤️ from Ali.
