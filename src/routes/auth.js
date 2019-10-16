import express from 'express';
import async from "async";
import nodemailer from "nodemailer";
import passport from "passport";

// Middlewares (minus Auth)
import * as validator from "../middleware/validator";
import {validationResult} from "express-validator";

// Models
import {User} from "../models/User";

const router = new express.Router();

/**
 * ROUTES
 *
 * POST /signup
 * POST /login
 * GET /logout
 * POST /check-valid-username
 * POST /forgot-password
 * POST /reset/:token
 */


/**
 * POST /signup
 * Create a new local account.
 */
router.post("/signup", validator.checkSignup, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).send({"success": false, "errors": errors.array()});
  }

  passport.authenticate("local-signup", (err, token, user) => {
    if (err) {
      return res.status(200).send({"success": false, "errors": [{msg: err.message}]});
    }

    return res.status(200).send({
      "success": true, "msg": "Signed up and logged in!", "data": {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        token
      }
    })
  })(req, res, next);
});

/**
 * POST /login
 * Sign in using email and password.
 */
router.post("/login", validator.checkEmail, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).send({"success": false, "errors": errors.array()});
  }

  passport.authenticate("local-login", (err, token, user) => {
    if (err) {
      return res.status(200).send({"success": false, "errors": [{msg: err.message}]});
    }

    return res.status(200).send({"success": true, "msg": "Success! You are logged in.", "data": {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        token
      }
    });
  })(req, res, next);
});


/**
 * GET /logout
 * Log out.
 */
router.get("/logout", (req, res) => {
  req.logout();
  return res.status(200).send({"success": true});
});

/**
 * POST /check-valid-username
 * Checks if username is valid.
 */
router.post("/check-valid-username", validator.checkUsername, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(200).send({"success": false, "errors": errors.array()});
  } else {

    User.findOne({ username: req.body.username }, (err, existingUser) => {
      if (err) { return next(err); }
      if (existingUser) {
        return res.status(200).send({"success": false, "errors": [{msg: "Sorry, this username is already taken 😕"}]});
      } else {
        return res.status(200).send({"success": true, "msg": "Username is valid!"});
      }
    });
  }
});

/**
 * POST /forgot-password
 * Create a random token, then the send user an email with a reset link.
 */
router.post("/forgot-password", validator.checkEmail, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).send({"success": false, "errors": errors.array()});
  }

  async.waterfall([
    function createRandomToken(done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    function setRandomToken(token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          return res.status(200).send({"success": false, "errors": [{msg: "Sorry, we don't have an email associated with that account. Please try again!"}]});
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token, user, done) {
      // const transporter = nodemailer.createTransport({
      //   host: 'smtp.gmail.com',
      //   port: 465,
      //   secure: true,
      //   auth: {
      //     type: 'OAuth2',
      //     clientId: process.env.GMAIL_CLIENT_ID,
      //     clientSecret: process.env.GMAIL_CLIENT_SECRET
      //   }
      // });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: "Simplata <hello@simplata.io>",
        subject: "Reset your password 👋",
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account at Palette.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          https://${process.env.FRONTEND_URL}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        res.status(200).send({"success": true, "msg": `An e-mail has been sent to ${user.email} with further instructions.`});
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    return res.status(200).send({"success": false, "errors": [{"msg": "Something went wrong 🙁. Try again!"}]});
  });
});

/**
 * POST /reset/:token
 * Process the reset password request.
 */
router.post("/reset/:token", validator.checkPassword, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).send({"success": false, "errors": errors.array()});
  }

  async.waterfall([
    function resetPassword(done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            return res.status(200).send({"success": false, "errors": [{msg: "Password reset link expired. Please try again!"}]});
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user, done) {
      // const transporter = nodemailer.createTransport({
      //   host: 'smtp.gmail.com',
      //   port: 465,
      //   secure: true,
      //   auth: {
      //     type: 'OAuth2',
      //     clientId: process.env.GMAIL_CLIENT_ID,
      //     clientSecret: process.env.GMAIL_CLIENT_SECRET
      //   }
      // });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: "Simplata <hello@simplata.io>",
        subject: "Your password has been changed ✌️",
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };

      transporter.sendMail(mailOptions, (err) => {
        res.status(200).send({"success": true, "msg": `Success! Your password has been changed ✌️. 
                Use ${user.email} and your new password to login at https://${process.env.FRONTEND_URL}/login`});
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    return res.status(200).send({"success": false, "errors": [{"msg": "Something went wrong 🙁. Try again!"}]});
  });
});

// /**
//  * POST /account/profile
//  * Update profile information.
//  */
// export const postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
//     check("email", "Please enter a valid email address.").isEmail();
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     sanitize("email").normalizeEmail({ gmail_remove_dots: false });
//
//     const errors = validationResult(req);
//
//     if (!errors.isEmpty()) {
//         req.flash("errors", errors.array());
//         return res.redirect("/account");
//     }
//
//     User.findById(req.user.id, (err, user: UserDocument) => {
//         if (err) { return next(err); }
//         user.email = req.body.email || "";
//         user.profile.name = req.body.name || "";
//         user.profile.gender = req.body.gender || "";
//         user.profile.location = req.body.location || "";
//         user.profile.website = req.body.website || "";
//         user.save((err: WriteError) => {
//             if (err) {
//                 if (err.code === 11000) {
//                     req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
//                     return res.redirect("/account");
//                 }
//                 return next(err);
//             }
//             req.flash("success", { msg: "Profile information has been updated." });
//             res.redirect("/account");
//         });
//     });
// };
//
// /**
//  * POST /account/password
//  * Update current password.
//  */
// export const postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
//     check("password", "Password must be at least 4 characters long").isLength({ min: 4 });
//     check("confirmPassword", "Passwords do not match").equals(req.body.password);
//
//     const errors = validationResult(req);
//
//     if (!errors.isEmpty()) {
//         req.flash("errors", errors.array());
//         return res.redirect("/account");
//     }
//
//     User.findById(req.user.id, (err, user: UserDocument) => {
//         if (err) { return next(err); }
//         user.password = req.body.password;
//         user.save((err: WriteError) => {
//             if (err) { return next(err); }
//             req.flash("success", { msg: "Password has been changed." });
//             res.redirect("/account");
//         });
//     });
// };
//
// /**
//  * POST /account/delete
//  * Delete user account.
//  */
// export const postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
//     User.remove({ _id: req.user.id }, (err) => {
//         if (err) { return next(err); }
//         req.logout();
//         req.flash("info", { msg: "Your account has been deleted." });
//         res.redirect("/");
//     });
// };
//
//

module.exports = router;
