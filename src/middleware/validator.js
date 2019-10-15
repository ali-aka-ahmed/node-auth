import { check, sanitize } from 'express-validator';
/**
 * Usage: POST /check-valid-username
 */
export const checkUsername = [
    check("username")
        .exists().withMessage("Please enter a username!")
        .custom(value => !/\s/.test(value)).withMessage("Username cannot have spaces. Try using a dash!")
        .isLength({min: 3}).withMessage("Your username must be at least 3 characters long!")
];

/**
 * Usage: POST /forgot
 * Usage: POST /login
 */
export const checkEmail = [
  check("email")
  .exists().withMessage("Please enter an email!")
  .isEmail().withMessage("Please ensure your email address is valid."),
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize("email").normalizeEmail({ gmail_remove_dots: false })
];

/**
 * Usage: POST /reset/:token
 */
export const checkPassword = [
  check("password")
  .exists().withMessage("Please enter a password!")
  .isLength({min: 8, max: 30}).withMessage("Password must be between 8 and 30 characters long")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[a-zA-Z0-9\S]{8,30}$/).withMessage("Your password needs to be " +
    "between 8 and 30 characters long and contain at least one lowercase letter, uppercase letter, number and special character."),
];

/**
 * Usage: POST /signup
 */
export const checkSignup = [
    check("firstName")
        .exists().withMessage("Please enter a first name!")
        .isAlpha().withMessage("Does your first name really have a number or special character in it 🤔. Please try again!"),
    check("lastName")
        .exists().withMessage("Please enter a last name!")
        .isAlpha().withMessage("Does your last name really have a number or special character in it 🤔. Please try again!")
].concat(checkUsername).concat(checkEmail).concat(checkPassword);

/**
 * Usage: POST /repository-title-search
 */
export const checkRepoTitle = [
  check("title")
  .exists().withMessage("Please enter a project name!")
  .custom(value => !/\s/.test(value)).withMessage("Project name cannot have spaces. Try using a dash!")
];
