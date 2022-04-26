const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(
  "sk_test_51JzE2ySGd5ZirT6ts4k9E8HG0V0dFhWbhmDyM5Umb3JClnVgkwtK3T4r2tNVekBZN3Z9VWvyvhjGxf7707lXk1x800UVupPTxQ"
);

const mailgun = require("mailgun-js");
const DOMAIN = "sandbox8551b768641942ec9ebfbcae4d02b187.mailgun.org";
const mg = mailgun({
  apiKey: "2eea812310d50da85d345bf6c6d644c8-1831c31e-87a94ba7",
  domain: DOMAIN,
});

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const Contact = require("../models/contact");
const Feedback = require('../models/feedback');

const { validationResult } = require("express-validator/check");

const ITEMS_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getHome = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/home", {
        prods: products,
        pageTitle: "Home",
        path: "/",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getContact = (req, res, next) => {
  res.render("shop/contact", {
    pageTitle: "Contact",
    path: "/contact",
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddContact = (req, res, next) => {
  const fname = req.body.fname;
  const email = req.body.email;
  const phoneno = req.body.phoneno;
  const question = req.body.question;
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('shop/contact', {
      pageTitle: 'Contact',
      path: "/contact",
      hasError: true,
      contact: {
        fname: fname,
        email: email,
        phoneno: phoneno,
        question: question
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const contact = new Contact({
    fname: fname,
    email: email,
    phoneno: phoneno,
    question: question
  });
  contact
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Contact');
      res.redirect('/contact');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getFeedback = (req, res, next) => {
  res.render("shop/feedback", {
    pageTitle: "Feedback",
    path: "/feedback",
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddFeedback = (req, res, next) => {
  const fname = req.body.fname;
  const email = req.body.email;
  const phoneno = req.body.phoneno;
  const message = req.body.message;
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('shop/feedback', {
      pageTitle: 'Feedback',
      path: "/feedback",
      hasError: true,
      feedback: {
        fname: fname,
        email: email,
        phoneno: phoneno,
        message: message
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const feedback = new Feedback({
    fname: fname,
    email: email,
    phoneno: phoneno,
    message: message
  });
  feedback
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Feedback');
      res.redirect('/feedback');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAbout = (req, res, next) => {
  res.render("shop/about", {
    pageTitle: "About",
    path: "/about"
  });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/shop",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.searchTitle = (req, res, next) => {
  Product.find({
    $or: [
      { title: { $regex: req.query.search, $options: "i" } },
    ],
  })
    .sort({ title: 1 })
    .then((product) => {
      res.render("shop/search", {
        prods: product,
        pageTitle: "Search",
        path: "/search",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDecreaseProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .decreaseFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: "inr",
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success", // => http://localhost:3000
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          email: req.user.email,
          userId: req.user,
          phoneno: req.user.phoneno,
          address: req.user.address,
          pincode: req.user.pincode,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          email: req.user.email,
          userId: req.user,
          phoneno: req.user.phoneno,
          address: req.user.address,
          pincode: req.user.pincode,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc
        .image("logo.png", 65, 65, { width: 50 })
        .fillColor("#444444")
        .fontSize(10)
        .text("Shopping Cart", 60, 120);

      pdfDoc.fontSize(26).text("Invoice", 60, 150);
      pdfDoc.fontSize(26).text("_________________________________", 60, 160);
      pdfDoc.fontSize(10).text("Order Id:", 60, 200);
      pdfDoc.fontSize(10).text(orderId, 150, 200);
      pdfDoc.fontSize(10).text("Invoice Date:", 60, 220);
      var date = order.date;
      var dd = String(date.getDate()).padStart(2, "0");
      var mm = String(date.getMonth() + 1).padStart(2, "0");
      var yyyy = date.getFullYear();
      date = mm + "/" + dd + "/" + yyyy;
      pdfDoc.fontSize(10).text(date, 150, 220);
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
      });
      pdfDoc.fontSize(10).text("Balance Due:", 60, 240);
      pdfDoc.fontSize(10).text("Rs. " + totalPrice, 150, 240);
      pdfDoc.fontSize(10).text("Name:", 310, 200);
      pdfDoc.fontSize(10).text(order.user.name, 360, 200);
      pdfDoc.fontSize(10).text("Email:", 310, 220);
      pdfDoc.fontSize(10).text(order.user.email, 360, 220);
      pdfDoc.fontSize(10).text("Phoneno:", 310, 240);
      pdfDoc.fontSize(10).text(order.user.phoneno, 360, 240);
      pdfDoc.fontSize(10).text("Address:", 310, 260);
      pdfDoc.fontSize(10).text(order.user.address, 360, 260);
      pdfDoc.fontSize(10).text("Pincode:", 310, 280);
      pdfDoc.fontSize(10).text(order.user.pincode, 360, 280);
      pdfDoc.fontSize(26).text("_________________________________", 60, 282);

      pdfDoc.fontSize(16).text("Item", 60, 370);
      pdfDoc.fontSize(16).text("Price", 200, 370);
      pdfDoc.fontSize(16).text("Quantity", 330, 370);
      pdfDoc.fontSize(26).text("_________________________________", 60, 372);
      order.products.forEach((prod) => {
        pdfDoc
          .fontSize(13)
          .text(
            prod.product.title +
              "-" +
              "Rs. " +
              prod.product.price +
              "x" +
              prod.quantity
          );
      });
      pdfDoc.fontSize(26).text("_________________________________", 60, 450);
      pdfDoc.fontSize(16).text("SubTotal: Rs. " + totalPrice, 380, 480);
      pdfDoc.fontSize(15).text("Important Note!", 60, 600);
      pdfDoc.fontSize(10).text("*  Thank You For Order!", 60, 630);
      pdfDoc.fontSize(10).text("*  Your Order Successfully Conformed!", 60, 650);
      pdfDoc.fontSize(10).text("*  Our Delivery Boy deliver Your Order within 4 days.", 60, 690);
      pdfDoc.fontSize(10).text("*  Order related any Question or Query Please Visit Our Shopping Cart Site and Contact Us.", 60, 670);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch((err) => next(err));
};

exports.deleteOrder = (req, res, next) => {
  const ordId = req.body.orderId;
  Order.deleteOne({
    _id: ordId,
  })
    .then(() => {
      console.log("DESTROYED ORDER");
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

