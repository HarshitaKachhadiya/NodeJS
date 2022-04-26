const crypto = require("crypto");

const bcrypt = require("bcryptjs");
//const nodemailer = require("nodemailer");
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox8551b768641942ec9ebfbcae4d02b187.mailgun.org";
const mg = mailgun({
  apiKey: "2eea812310d50da85d345bf6c6d644c8-1831c31e-87a94ba7",
  domain: DOMAIN,
});
//const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");

const AdminUser = require("../models/adminuser");
const User = require("../models/user");
const Product = require("../models/product");
const fileHelper = require("../util/file");

/* const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
); */

const ITEMS_PER_PAGE = 5;

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Add Role",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      phoneno: ""
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  AdminUser.findOne({ email: email })
    .then((adminuser) => {
      if (!adminuser) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, adminuser.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.adminuser = adminuser;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/dashboard");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phoneno = req.body.phoneno;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Add Role",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
        phoneno: phoneno
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const adminuser = new AdminUser({
        name: name,
        email: email,
        password: hashedPassword,
        phoneno: phoneno
        //cart: { items: [] },
      });
      return adminuser.save();
    })
    .then((result) => {
      res.redirect("/manage-roles");
      return mg.messages().send({
        to: email,
        from: "kachhadiyaharshita456@gmail.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/login');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Forgot Password",
    errorMessage: message,
  });
};

exports.getMessage = (req, res, next) => {
  res.render("auth/message", {
    pageTitle: "Message"
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    AdminUser.findOne({ email: req.body.email })
      .then((adminuser) => {
        if (!adminuser) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        adminuser.resetToken = token;
        adminuser.resetTokenExpiration = Date.now() + 3600000;
        return adminuser.save();
      })
      .then((result) => {
        res.redirect("/message");
        mg.messages().send({
          to: req.body.email,
          from: "kachhadiyaharshita456@gmail.com",
          subject: "Password reset",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:8000/reset/${token}">link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  AdminUser.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(adminuser => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        pageTitle: 'Set Password',
        errorMessage: message,
        adminuserId: adminuser._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const adminuserId = req.body.adminuserId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  AdminUser.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: adminuserId,
  })
    .then((adminuser) => {
      resetUser = adminuser;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getManageRoles = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  AdminUser.find()
    .countDocuments()
    .then((numAdminUsers) => {
      totalItems = numAdminUsers;
      return AdminUser.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then((adminusers) => {
      res.render("auth/manage-roles", {
        adminusers: adminusers,
        pageTitle: "Manage Roles",
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

// exports.deleteAdmin = (req, res, next) => {
//   const adminuserId = req.body.adminuserId;
//   AdminUser.deleteOne({
//     _id: adminuserId,
//   })
//     .then(() => {
//       console.log("DESTROYED ADMIN USER");
//       res.redirect("/manage-roles");
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.searchName = (req, res, next) => {
  AdminUser.find({
    $or: [
      { name: { $regex: req.query.search, $options: "i" } }
    ],
  })
    .sort({ name: 1 })
    .then((adminusers) => {
      res.render("auth/manage-roles-search", {
        adminusers: adminusers,
        pageTitle: "Manage Roles",
        path: "/manage-roles-search",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getUsers = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  User.find()
    .countDocuments()
    .then((numUsers) => {
      totalItems = numUsers;
      return User.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then((users) => {
      res.render("auth/users", {
        users: users,
        pageTitle: "Manage Users",
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

exports.searchEmail = (req, res, next) => {
  User.find({
    $or: [
      { name: { $regex: req.query.search, $options: "i" } }
    ],
  })
    .sort({ name: 1 })
    .then((users) => {
      res.render("auth/users-search", {
        users: users,
        pageTitle: "Manage Users",
        path: "/users-search",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
