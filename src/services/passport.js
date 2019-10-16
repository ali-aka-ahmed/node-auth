import passport from 'passport';
import passportLocal from 'passport-local';
import jwt from 'jsonwebtoken';

const User = require('../models/User');

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/**
 * Login strategy.
 */
export const localLogin = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {

  const userData = {
    email: email.trim(),
    password: password.trim()
  };

  User.findOne({ email: userData.email }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(new Error(`Email ${userData.email} not found.`));
    }
    user.comparePassword(userData.password, (err, isMatch) => {
      if (err) { return done(err); }
      if (!isMatch) {
        return done(new Error('Invalid email or password.'));
      }

      const payload = {
        sub: user._id
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);
      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      };

      return done(null, token, userData);
    });
  });
});


/**
 * Sign up strategy.
 */
export const localSignup = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {

  const userData = {
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    username: req.body.username.trim(),
    email: email.trim(),
    password: password.trim()
  };

  User.findOne({ email: userData.email }, (err, user) => {
    if (err) { return done(err); }
    if (user) {
      return done(new Error(`Account with email ${userData.email} already exists.`));
    }

    User.findOne({username: userData.username}, (err, user) => {
      if (err) { return done(err); }
      if (user) {
        return done(new Error('Sorry, that username is already taken.'));
      }

      const newUser = new User(userData);

      newUser.save((err, user) => {
        if (err) { return done(err); }

        const payload = {
          sub: user._id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return done(null, token, user);
      });
    })
  });
});
