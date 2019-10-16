import jwt from 'jsonwebtoken';

const User = require('../models/User');

/**
 *  Authorization required middleware.
 */
export default (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).end();
  }

  // get the last part from an authorization header string like "bearer <token-value>"
  const token = req.headers.authorization.split(' ')[1];

  // decode the token using a secret key-phrase
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // the 401 code is for unauthorized status
    if (err) { return res.status(401).end(); }

    const userId = decoded.sub;

    // check if a user exists
    return User.findById(userId, (userErr, user) => {
      if (userErr || !user) {
        return res.status(401).end();
      }
      // make user available to req
      req.user = user;
      return next();
    });
  });
};