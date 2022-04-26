const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const { body } = require("express-validator/check");

const router = express.Router();

const isAuth = require('../middleware/is-auth');

router.get("/dashboard", isAuth, adminController.getDashboard);

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product",[
    body("title", "Please Enter a Product Title at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
    body("category", "Please Enter a Product Category at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
    body("subcategory", "Please Enter a Product SubCategory at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
    body("size", "Please Enter a Product Size.").isString().isLength({ min: 1 }).trim(),
    body("color", "Please Enter a Product Color.").isString().isLength({ min: 1 }).trim(),
    body("actprice", "Please Enter a Actual Price.").isFloat(),
    body("price", "Please Enter a Selling Price.").isFloat(),
    body("discount", "Please Enter a Discount.").isFloat(),
    body("description", "Please Enter a Description at least 5 Characters.").isLength({ min: 5, max: 400 }).trim(),
  ], isAuth, adminController.postAddProduct);

router.get("/manage-product", isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body("title", "Please Enter a Product Title at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
    body("category", "Please Enter a Product Category at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
    body("subcategory", "Please Enter a Product SubCategory at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
    body("size", "Please Enter a Product Size.").isString().isLength({ min: 1 }).trim(),
    body("color", "Please Enter a Product Color.").isString().isLength({ min: 1 }).trim(),
    body("actprice", "Please Enter a Actual Price.").isFloat(),
    body("price", "Please Enter a Price.").isFloat(),
    body("discount", "Please Enter a Discount.").isFloat(),
    body("description", "Please Enter a Description at least 5 Characters.").isLength({ min: 5, max: 400 }).trim(),
  ], isAuth, adminController.postEditProduct);

router.get("/add-deliveryboy", isAuth, adminController.getAddSupplier);

router.post("/add-deliveryboy",[
  body("fname", "Please Enter a Full Name at least 4 Characters.").isString().isLength({ min: 4 }).trim(),
  body("email", "Please Enter a Valid Email Address.")
      .isEmail()
      .normalizeEmail(),
  body("phoneno", "Please Enter a Phone No at least 10 Digits.")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .trim(),
  body("title", "Please Enter a Product Title at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
  body("price", "Please Enter a Product Price.").isFloat()
], isAuth, adminController.postAddSupplier);

router.get("/manage-deliveryboy", isAuth, adminController.getSuppliers);

router.get('/edit-deliveryboy/:supplierId', isAuth, adminController.getEditSupplier);

router.post('/edit-deliveryboy', [
  body("fname", "Please Enter a Full Name at least 4 Characters.").isString().isLength({ min: 4 }).trim(),
  body("email", "Please Enter a Valid Email Address.")
      .isEmail()
      .normalizeEmail(),
  body("phoneno", "Please Enter a Phone No at least 10 Digits.")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .trim(),
  body("title", "Please Enter a Product Title at least 3 Characters.").isString().isLength({ min: 3 }).trim(),
  body("price", "Please Enter a Product Price.").isFloat()
  ], isAuth, adminController.postEditSupplier);

router.post('/delete-deliveryboy', isAuth, adminController.postDeleteSupplier);

router.get("/deliveryboy-search", isAuth, adminController.searchSupplierName);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get("/products-search", isAuth, adminController.searchTitle);

router.get("/cart/:userId", isAuth, adminController.getCart);

router.get("/order/:userId", isAuth, adminController.getOrders);

router.post("/delete-order", isAuth, adminController.deleteOrder);

router.post("/delete-user", isAuth, adminController.deleteUser);

router.get("/contact", isAuth, adminController.getContact);

router.get("/contact-search", isAuth, adminController.searchContact);

router.post('/delete-contact', isAuth, adminController.postDeleteContact);

router.get("/feedback", isAuth, adminController.getFeedback);

router.get("/feedback-search", isAuth, adminController.searchFeedback);

router.post('/delete-feedback', isAuth, adminController.postDeleteFeedback);

router.get("/manage-product/:productId", isAuth, adminController.getProduct);

module.exports = router;
