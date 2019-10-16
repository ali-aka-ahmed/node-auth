import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import path from 'path';
import passport from 'passport';
import httpLogger from 'morgan';
import { connectMongo } from './models';
import { MONGODB_URI } from './util/secrets';

// connect to MongoDB
connectMongo(MONGODB_URI);

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 5000);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(httpLogger('dev', { skip: () => app.get('env') === 'test' }));
app.use((req, res, next) => { res.locals.user = req.user; next(); });
app.use( express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

// Passport authentication strategies
import { localLogin } from './services/passport';
import { localSignup } from './services/passport';
passport.use('local-signup', localSignup);
passport.use('local-login', localLogin);

// AUTH CHECK MIDDLEWARE (comment lines to turn off auth)
import authMiddleware from './middleware/auth';
app.use('/api', authMiddleware);

// ROUTES
import authRoutes from './routes/auth'
import apiRoutes from './routes/api'
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

export default app;
