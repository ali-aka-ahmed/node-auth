import express from 'express';
import compression from 'compression';
import session from 'express-session';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import path from 'path';
import passport from 'passport';
import { connect } from './models';
import { MONGODB_URI, SESSION_SECRET } from './util/secrets';

// connect to MongoDB
connect(MONGODB_URI)
const MongoStore = mongo(session);

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 5000);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: MONGODB_URI,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// load passport authentication strategies
import { localLogin } from './passport';
import { localSignup } from './passport';
passport.use('local-signup', localSignup);
passport.use('local-login', localLogin);


// middleware
import * as validator from "./middleware/validator";
import authMiddleware from "./middleware/auth";

// controllers
import * as authServices from "./routes-services/auth";

/**
 * AUTH routes.
 */
app.post("/signup", validator.checkSignup, authServices.postSignup);
app.post("/login", validator.checkEmail, authServices.postLogin);
app.get("/logout", authServices.logout);
app.post("/check-valid-username", validator.checkUsername, authServices.checkValidUsername);
app.post("/forgot-password", validator.checkEmail, authServices.postForgot);
app.post("/reset/:token", validator.checkPassword, authServices.postReset);


export default app;