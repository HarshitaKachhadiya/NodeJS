const path = require("path");

const express = require("express");

const { body } = require("express-validator/check");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getHome);

router.get("/shop", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.post("/cart-decrease-item", isAuth, shopController.postCartDecreaseProduct);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", shopController.getCheckoutSuccess);

router.get("/checkout/cancel", shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.post("/delete-order", isAuth, shopController.deleteOrder);

router.get("/search", shopController.searchTitle);

router.get("/contact", isAuth, shopController.getContact);

router.post("/contact", [
    body("fname", "Please Enter a Full Name at least 4 Characters.").isString().isLength({ min: 4 }).trim(),
    body("email", "Please Enter a Valid Email Address.")
      .isEmail()
      .normalizeEmail(),
    body("phoneno", "Please Enter a Phone No at least 10 Digits.")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .trim(),
    body("question", "Please Enter a Question at least 5 Characters.").isLength({ min: 5, max: 400 }).trim(),
], isAuth, shopController.postAddContact);

router.get("/feedback", isAuth, shopController.getFeedback);

router.post("/feedback", [
  body("fname", "Please Enter a Full Name at least 4 Characters.").isString().isLength({ min: 4 }).trim(),
  body("email", "Please Enter a Valid Email Address.")
    .isEmail()
    .normalizeEmail(),
  body("phoneno", "Please Enter a Phone No at least 10 Digits.")
    .isNumeric()
    .isLength({ min: 10, max: 10 })
    .trim(),
  body("message", "Please Enter a Message at least 5 Characters.").isLength({ min: 5, max: 400 }).trim(),
], isAuth, shopController.postAddFeedback);

router.get("/about", isAuth, shopController.getAbout);

module.exports = router;
