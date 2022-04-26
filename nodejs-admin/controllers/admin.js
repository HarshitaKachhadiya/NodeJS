const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Contact = require("../models/contact");
const Feedback = require("../models/feedback");
const Supplier = require("../models/supplier");

const fileHelper = require("../util/file");

const { validationResult } = require("express-validator/check");

const ITEMS_PER_PAGE = 5;

exports.getDashboard = (req, res, next) => {
  res.render("admin/dashboard", {
    pageTitle: "Dashboard"
  });
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.getAddSupplier = (req, res, next) => {
  res.render('admin/add-supplier', {
    pageTitle: 'Add Delivery Boy',
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};


exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const category = req.body.category;
  const subcategory = req.body.subcategory;
  const size = req.body.size;
  const color = req.body.color;
  const actprice = req.body.actprice;
  const price = req.body.price;
  const discount = req.body.discount;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      hasError: true,
      product: {
        title: title,
        imageUrl: image,
        category: category,
        subcategory: subcategory,
        size: size,
        color: color,
        actprice: actprice,
        price: price,
        discount: discount,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  if (!image) {
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      hasError: true,
      product: {
        title: title,
        category: category,
        subcategory: subcategory,
        size: size,
        color: color,
        actprice: actprice,
        price: price,
        discount: discount,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    category: category,
    subcategory: subcategory,
    size: size,
    color: color,
    actprice: actprice,
    price: price,
    discount: discount,
    description: description,
    imageUrl: imageUrl,
    adminuserId: req.adminuser
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/manage-product');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postAddSupplier = (req, res, next) => {
  const fname = req.body.fname;
  const email = req.body.email;
  const phoneno = req.body.phoneno;
  const title = req.body.title;
  const price = req.body.price;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/add-supplier', {
      pageTitle: 'Add Delivery Boy',
      hasError: true,
      supplier: {
        fname: fname,
        email: email,
        phoneno: phoneno,
        title: title,
        price: price
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const supplier = new Supplier({
    fname: fname,
    email: email,
    phoneno: phoneno,
    title: title,
    price: price,
    adminuserId: req.adminuser
  });
  supplier
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Supplier');
      res.redirect('/manage-deliveryboy');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find({ adminuserId: req.adminuser._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Manage Products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSuppliers = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Supplier.find()
    .countDocuments()
    .then((numSuppliers) => {
      totalItems = numSuppliers;
      return Supplier.find({ adminuserId: req.adminuser._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    })
    .then((suppliers) => {
      res.render("admin/suppliers", {
        supps: suppliers,
        pageTitle: "Manage Delivery Boy",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.searchSupplierName = (req, res, next) => {
  Supplier.find({
    $or: [
      { fname: { $regex: req.query.search, $options: "i" } },
    ],
  })
    .sort({ fname: 1 })
    .then((supplier) => {
      res.render("admin/suppliers-search", {
        supps: supplier,
        pageTitle: "Manage Delivery Boy",
        path: "/deliveryboy-search",
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
      res.render("admin/products-search", {
        prods: product,
        pageTitle: "Manage Products",
        path: "/products-search",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/dashboard');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        product: product,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedCategory = req.body.category;
  const updatedSubCategory = req.body.subcategory;
  const updatedSize = req.body.size;
  const updatedColor = req.body.color;
  const updatedActprice = req.body.actprice;
  const updatedPrice = req.body.price;
  const updatedDiscount = req.body.discount;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      product: {
        title: updatedTitle,
        category: updatedCategory,
        subcategory: updatedSubCategory,
        size: updatedSize,
        color: updatedColor,
        actprice: updatedActprice,
        price: updatedPrice,
        discount: updatedDiscount,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.adminuserId.toString() !== req.adminuser._id.toString()) {
        return res.redirect('/manage-product');
      }
      product.title = updatedTitle;
      product.category = updatedCategory;
      product.subcategory = updatedSubCategory;
      product.size = updatedSize;
      product.color = updatedColor;
      product.actprice = updatedActprice;
      product.price = updatedPrice;
      product.discount = updatedDiscount;
      product.description = updatedDesc;
      if (image) {
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/manage-product');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then((product) => {
    if (!product) {
      return next(new Error("Product not found."));
    }

    return Product.deleteOne({ _id: prodId, adminuserId: req.adminuser._id })
  })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/manage-product');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditSupplier = (req, res, next) => {
  const suppId = req.params.supplierId;
  Supplier.findById(suppId)
    // Product.findById(prodId)
    .then(supplier => {
      if (!supplier) {
        return res.redirect('/dashboard');
      }
      res.render('admin/edit-supplier', {
        pageTitle: 'Edit Delivery Boy',
        supplier: supplier,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditSupplier = (req, res, next) => {
  const suppId = req.body.supplierId;
  const updatedFname = req.body.fname;
  const updatedEmail = req.body.email;
  const updatedPhoneno = req.body.phoneno;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-supplier', {
      pageTitle: 'Edit Delivery Boy',
      supplier: {
        fname: updatedFname,
        email: updatedEmail,
        phoneno: updatedPhoneno,
        title: updatedTitle,
        price: updatedPrice,
        _id: suppId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Supplier.findById(suppId)
    .then(supplier => {
      if (supplier.adminuserId.toString() !== req.adminuser._id.toString()) {
        return res.redirect('/manage-deliveryboy');
      }
      supplier.fname = updatedFname;
      supplier.email = updatedEmail;
      supplier.phoneno = updatedPhoneno;
      supplier.title = updatedTitle;
      supplier.price = updatedPrice;
      return supplier.save().then(result => {
        console.log('UPDATED SUPPLIER!');
        res.redirect('/manage-deliveryboy');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteSupplier = (req, res, next) => {
  const suppId = req.body.supplierId;
  Supplier.findById(suppId).then((supplier) => {
    if (!supplier) {
      return next(new Error("Supplier not found."));
    }

    return Supplier.deleteOne({ _id: suppId, adminuserId: req.adminuser._id })
  })
    .then(() => {
      console.log('DESTROYED SUPPLIER');
      res.redirect('/manage-deliveryboy');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  const userId = req.params.userId;

  const page = +req.query.page || 1;
  let totalItems;

  User.findById(userId)
    .countDocuments()
    .then((numUsers) => {
      totalItems = numUsers;
      return User.findById(userId)
        .populate("cart.items.productId")
        .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
     })
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      res.render("admin/cart", {
        pageTitle: "Manage Carts",
        products: products,
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

exports.getOrders = (req, res, next) => {
  const userId = req.params.userId;

  const page = +req.query.page || 1;
  let totalItems;

  Order.find({ "user.userId": userId })
    .countDocuments()
    .then((numOrders) => {
      totalItems = numOrders;
      return Order.find({ "user.userId": userId })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
     })
    .then((orders) => {
      res.render("admin/order", {
        pageTitle: "Manage Orders",
        orders: orders,
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

exports.deleteOrder = (req, res, next) => {
  const ordId = req.body.orderId;
  Order.deleteOne({
    _id: ordId,
  })
    .then(() => {
      console.log("DESTROYED ORDER");
      res.redirect("/users");
    })
    .catch((err) => console.log(err));
};

exports.deleteUser = (req, res, next) => {
  const userId = req.body.userId;
  User.deleteOne({
    _id: userId,
  })
    .then(() => {
      console.log("DESTROYED USER");
      res.redirect("/users");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getContact = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Contact.find()
    .countDocuments()
    .then((numContacts) => {
      totalItems = numContacts;
      return Contact.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then((contacts) => {
      res.render("admin/contact", {
        conts: contacts,
        pageTitle: "Manage Contacts",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.searchContact = (req, res, next) => {
  Contact.find({
    $or: [
      { fname: { $regex: req.query.search, $options: "i" } },
    ],
  })
    .sort({ fname: 1 })
    .then((contact) => {
      res.render("admin/contact-search", {
        conts: contact,
        pageTitle: "Manage Contacts",
        path: "/contact-search",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteContact = (req, res, next) => {
  const contactId = req.body.contactId;
  Contact.deleteOne({
    _id: contactId,
  })
    .then(() => {
      console.log("DESTROYED CONTACT");
      res.redirect("/contact");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getFeedback = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Feedback.find()
    .countDocuments()
    .then((numFeedbacks) => {
      totalItems = numFeedbacks;
      return Feedback.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then((feedbacks) => {
      res.render("admin/feedback", {
        feeds: feedbacks,
        pageTitle: "Manage Feedbacks",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.searchFeedback = (req, res, next) => {
  Feedback.find({
    $or: [
      { fname: { $regex: req.query.search, $options: "i" } },
    ],
  })
    .sort({ fname: 1 })
    .then((feedback) => {
      res.render("admin/feedback-search", {
        feeds: feedback,
        pageTitle: "Manage Feedbacks",
        path: "/feedback-search",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteFeedback = (req, res, next) => {
  const feedbackId = req.body.feedbackId;
  Feedback.deleteOne({
    _id: feedbackId,
  })
    .then(() => {
      console.log("DESTROYED FEEDBACK");
      res.redirect("/feedback");
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
      res.render("admin/product-detail", {
        product: product,
        pageTitle: product.title
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



