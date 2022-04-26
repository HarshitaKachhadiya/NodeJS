const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");
const AdminUser = require("../models/adminuser");

const router = express.Router();

const isAuth = require('../middleware/is-auth');

router.get("/", authController.getLogin);

router.get("/login", authController.getLogin);

router.get("/signup", isAuth, authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email Address.")
      .normalizeEmail(),
    body('password', 'Please Enter a Valid Password.')
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    body("name", "Please Enter a Full Name at least 4 Characters.").isString().isLength({ min: 4 }).trim(),
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email Address.")
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return AdminUser.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please Enter a Password with only numbers and text and at least 5 Characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("phoneno", "Please Enter a Phone No at least 10 Digits.")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .trim()
  ],
  isAuth,
  authController.postSignup
);

router.post("/logout", isAuth, authController.postLogout);

router.get("/reset", authController.getReset);

router.get("/message", authController.getMessage);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.get("/manage-roles", isAuth, authController.getManageRoles);

//router.post("/delete-admin", isAuth, authController.deleteAdmin);

router.get("/manage-roles-search", isAuth, authController.searchName);

router.get("/users", isAuth, authController.getUsers);

router.get("/users-search", isAuth, authController.searchEmail);

module.exports = router;
