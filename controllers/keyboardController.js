const Keyboard = require('../models/keyboard');
const Brand = require('../models/brand');
const KeyboardInstance = require('../models/keyboardinstance');
const Switch = require('../models/keyboardswitch');

const async = require('async');

const { body, validationResult } = require('express-validator');

exports.index = (req, res) => {
  async.parallel(
    {
      keyboard_count(callback) {
        Keyboard.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      keyboard_instance_count(callback) {
        KeyboardInstance.countDocuments({}, callback);
      },
      keyboard_instance_available_count(callback) {
        KeyboardInstance.countDocuments({ status: 'In-stock' }, callback);
      },
      brand_count(callback) {
        Brand.countDocuments({}, callback);
      },
      switch_count(callback) {
        Switch.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render('index', {
        title: 'Keyboard Inventory',
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all keyboards.
exports.keyboard_list = (req, res, next) => {
  Keyboard.find({}, 'name brand')
    .sort({ name: 1 })
    .populate('brand')
    .exec(function (err, list_keyboards) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('keyboard_list', {
        title: 'Keyboard List',
        keyboard_list: list_keyboards,
      });
    });
};

// Display detail page for a specific keyboard.
exports.keyboard_detail = (req, res, next) => {
  async.parallel(
    {
      keyboard(callback) {
        Keyboard.findById(req.params.id)
          .populate('brand')
          .populate('switches')
          .exec(callback);
      },
      keyboard_instances(callback) {
        KeyboardInstance.find({ keyboard: req.params.id })
          .populate('keyboard')
          .populate('keyboard_switch')
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard == null) {
        // No results.
        const err = new Error('Keyboard not found');
        err.status = 404;
        return next(err);
      }
      console.log(results.keyboard);
      // Successful, so render.
      res.render('keyboard_detail', {
        title: results.keyboard.name,
        keyboard: results.keyboard,
        keyboard_instances: results.keyboard_instances,
      });
    }
  );
};

// Display keyboard create form on GET.
exports.keyboard_create_get = (req, res, next) => {
  // Get all brands and switches, which we can use for adding to our book.
  async.parallel(
    {
      brands(callback) {
        Brand.find(callback);
      },
      switches(callback) {
        Switch.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render('keyboard_form', {
        title: 'Create New Keyboard',
        brands: results.brands,
        switches: results.switches,
      });
    }
  );
};

// Handle keyboard create on POST.
exports.keyboard_create_post = [
  // Convert the switches to an array.
  (req, res, next) => {
    console.log(req.body);

    if (!Array.isArray(req.body.switches)) {
      req.body.switches =
        typeof req.body.switches === 'undefined' ? [] : [req.body.switches];
    }
    next();
  },
  // Validate and sanitize fields.
  body('name', 'Name must be at least 3 characters.')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('brand', 'Brand name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Description must not be empty.').trim().escape(),
  body('price', 'Please fill out a price')
    .trim()
    .isInt()
    .withMessage('Price should be a number')
    .isLength({ min: 1 })
    .escape(),
  body('switches.*').escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Keyboard object with escaped and trimmed data.
    const keyboard = new Keyboard({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      switches: req.body.switches,
      price: req.body.price,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all brands and switches for form.
      async.parallel(
        {
          brands(callback) {
            Brand.find(callback);
          },
          switches(callback) {
            Switch.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected switch as checked.
          for (const keyboard_switch of results.switches) {
            if (keyboard.switches.includes(keyboard_switch._id)) {
              keyboard_switch.checked = 'checked';
            }
          }
          console.log(results.switches.checked);
          res.render('keyboard_form', {
            title: 'Create New Keyboard',
            brands: results.brands,
            switches: results.switches,
            keyboard,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save book.
    keyboard.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new book record.
      res.redirect(keyboard.url);
    });
  },
];

// Display keyboard delete form on GET.
exports.keyboard_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard delete GET');
};

// Handle keyboard delete on POST.
exports.keyboard_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard delete POST');
};

// Display keyboard update form on GET.
exports.keyboard_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard update GET');
};

// Handle keyboard update on POST.
exports.keyboard_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard update POST');
};
