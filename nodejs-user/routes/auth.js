const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter a Valid Email Address.')
      .normalizeEmail(),
    body('password', 'Please Enter a Valid Password.')
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    body("name", "Please Enter a Full Name at least 4 Characters.").isString().isLength({ min: 4 }).trim(),
    check('email')
      .isEmail()
      .withMessage('Please Enter a Valid Email Address.')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please Enter a Password with only numbers and text and at least 5 Characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
      .trim(),
    body("phoneno", "Please Enter a Phone No at least 10 Digits.")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .trim(),
    body("address", "Please Enter a Address at least 5 Characters.").isString().isLength({ min: 5 }).trim(),
    body("pincode", "Please Enter a Pincode at least 6 Digits.")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .trim()
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

router.get("/message", authController.getMessage);

module.exports = router;
