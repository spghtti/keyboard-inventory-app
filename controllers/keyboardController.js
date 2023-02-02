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
      keyboard_instance_available_count(callback) {
        KeyboardInstance.countDocuments({ status: 'In-stock' }, callback);
      },
      keyboard_instance_returned_count(callback) {
        KeyboardInstance.countDocuments({ status: 'Returned' }, callback);
      },
      keyboard_instance_sold_count(callback) {
        KeyboardInstance.countDocuments({ status: 'Sold' }, callback);
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
        title: 'Keyboard Inventory App',
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all keyboards.
exports.keyboard_list = (req, res, next) => {
  Keyboard.find({})
    .populate('brand')
    .sort({ 'brand.name': 1 })
    .exec(function (err, list_keyboards) {
      if (err) {
        return next(err);
      }
      list_keyboards.sort(function (a, b) {
        let keyboardA = a.brand.name;
        let keyboardB = b.brand.name;
        return keyboardA < keyboardB ? -1 : keyboardA > keyboardB ? 1 : 0;
      });
      //Successful, so render
      res.render('keyboard_list', {
        title: 'All Keyboards',
        keyboard_list: list_keyboards,
      });
    });
};

// Display detail page for a specific keyboard.
exports.keyboard_detail = (req, res, next) => {
  async.parallel(
    {
      keyboard(callback) {
        Keyboard.findById(req.params.id).populate('brand').exec(callback);
      },
      keyboard_instances(callback) {
        KeyboardInstance.find({ keyboard: req.params.id })
          .populate('keyboard')
          .populate('keyboard_switch')
          .exec(callback);
      },
    },
    (err, results) => {
      console.log(results);
      if (err) {
        return next(err);
      }
      if (results.keyboard == null) {
        // No results.
        const err = new Error('Keyboard not found');
        err.status = 404;
        return next(err);
      }
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
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render('keyboard_form', {
        title: 'Create New Keyboard',
        brands: results.brands,
      });
    }
  );
};

// Handle keyboard create on POST.
exports.keyboard_create_post = [
  // Convert the switches to an array.
  // Validate and sanitize fields.
  body('name', 'Name must be 3-100 characters.')
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body('brand', 'Brand name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters')
    .escape(),
  body('price', 'Please fill out a price')
    .trim()
    .isInt({ min: 1 })
    .withMessage('Price must be at least $1')
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Keyboard object with escaped and trimmed data.
    const keyboard = new Keyboard({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
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
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          res.render('keyboard_form', {
            title: 'Create New Keyboard',
            brands: results.brands,
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
exports.keyboard_delete_get = (req, res, next) => {
  async.parallel(
    {
      keyboard(callback) {
        Keyboard.findById(req.params.id).exec(callback);
      },
      keyboard_instances(callback) {
        KeyboardInstance.find({ keyboard: req.params.id })
          .populate({
            path: 'keyboard',
            model: 'Keyboard',
            populate: [
              {
                path: 'brand',
                model: 'Brand',
              },
            ],
          })
          .populate('keyboard_switch')
          .exec(callback);
      },
    },
    (err, results) => {
      console.log(results);
      if (err) {
        return next(err);
      }
      if (results.keyboard == null) {
        // No results.
        res.redirect('/inventory/keyboards');
      }
      // Successful, so render.
      res.render('keyboard_delete', {
        title: 'Delete a Keyboard',
        keyboard: results.keyboard,
        keyboard_instances: results.keyboard_instances,
      });
    }
  );
};

// Handle keyboard delete on POST.
exports.keyboard_delete_post = (req, res, next) => {
  async.parallel(
    {
      keyboard(callback) {
        Keyboard.findById(req.params.id).exec(callback);
      },
      keyboard_instances(callback) {
        KeyboardInstance.find({ keyboard: req.params.id })
          .populate({
            path: 'keyboard',
            model: 'Keyboard',
            populate: [
              {
                path: 'brand',
                model: 'Brand',
              },
            ],
          })
          .populate('keyboard_switch')
          .exec(callback);
      },
    },
    (err, results) => {
      console.log('!!!!!');
      console.log(results.keyboard_instances);
      if (err) {
        return next(err);
      }
      // Success
      if (results.keyboard_instances.length > 0) {
        // Keyboard has books. Render in same way as for GET route.
        res.render('switch_delete', {
          title: 'Delete a Switch',
          keyboard: results.keyboard,
          keyboard_instances: results.keyboard_instances,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      Keyboard.findByIdAndRemove(req.body.keyboard_id, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect('/inventory/keyboards');
      });
    }
  );
};

// Display keyboard update form on GET.
exports.keyboard_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      keyboard(callback) {
        Keyboard.findById(req.params.id).populate('brand').exec(callback);
      },
      brands(callback) {
        Brand.find(callback);
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
      res.render('keyboard_form', {
        title: 'Update Keyboard',
        brands: results.brands,
        keyboard: results.keyboard,
      });
    }
  );
};

// Handle keyboard update on POST.
exports.keyboard_update_post = [
  // Validate and sanitize fields.
  body('name', 'Name must be 3-100 characters.')
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body('brand', 'Brand name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters')
    .escape(),
  body('price', 'Please fill out a price')
    .trim()
    .isInt({ min: 1 })
    .withMessage('Price must be at least $1')
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const keyboard = new Keyboard({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          brands(callback) {
            Brand.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          // Mark our selected genres
          res.render('keyboard_form', {
            title: 'Update Keyboard',
            brands: results.brands,
            keyboard,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Keyboard.findByIdAndUpdate(
      req.params.id,
      keyboard,
      {},
      (err, thekeyboard) => {
        if (err) {
          return next(err);
        }

        // Successful: redirect to book detail page.
        res.redirect(thekeyboard.url);
      }
    );
  },
];
