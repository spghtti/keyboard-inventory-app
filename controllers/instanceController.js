const KeyboardInstance = require('../models/keyboardinstance');
const Keyboard = require('../models/keyboard');
const KeyboardSwitch = require('../models/keyboardswitch');

const async = require('async');

const { body, validationResult } = require('express-validator');

// Display list of all Keyboardinstances.
exports.keyboardinstance_list = (req, res, next) => {
  KeyboardInstance.find({
    sort: {
      // prettier-ignore
      'status': 1,
    },
  })
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
    .exec(function (err, list_keyboardinstances) {
      if (err) {
        return next(err);
      }
      list_keyboardinstances.sort(function (a, b) {
        let statusA = a.status;
        let statusB = b.status;
        let brandA = a.keyboard.brand.name;
        let brandB = b.keyboard.brand.name;

        if (statusA == statusB) {
          return brandA < brandB ? -1 : brandA < brandB ? 1 : 0;
        } else {
          return statusA < statusB ? -1 : 1;
        }
      });
      // Successful, so render
      res.render('instance_list', {
        title: 'Keyboard Instance List',
        keyboardinstance_list: list_keyboardinstances,
      });
    });
};

// Display detail page for a specific Keyboardinstance.
exports.keyboardinstance_detail = (req, res, next) => {
  KeyboardInstance.findById(req.params.id)
    .populate('keyboard')
    .populate('keyboard_switch')
    .exec((err, keyboardinstance) => {
      if (err) {
        return next(err);
      }
      if (keyboardinstance == null) {
        // No results.
        const err = new Error('Instance not found');
        err.status = 404;
        return next(err);
      }
      console.log(keyboardinstance.keyboard_switch);
      // Successful, so render.
      res.render('instance_detail', {
        title: `Keyboard: ${keyboardinstance.keyboard.name}`,
        keyboardinstance,
      });
    });
};

// Display Keyboardinstance create form on GET.
exports.keyboardinstance_create_get = (req, res, next) => {
  Keyboard.find({}, 'name')
    .populate('brand')
    .exec((err, keyboards) => {
      if (err) {
        return next(err);
      }
      KeyboardSwitch.find({}, 'display_name').exec((err, switches) => {
        if (err) {
          return next(err);
        }
        res.render('instance_form', {
          title: 'Create New Instance',
          keyboard_list: keyboards,
          keyboard_switch_list: switches,
        });
      });
    });
};

// Handle Keyboardinstance create on POST.
exports.keyboardinstance_create_post = [
  // Validate and sanitize fields.
  body('keyboard', 'Keyboard must be specified')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('status').escape(),
  body('keyboard_switch', 'Specify a switch type').trim().escape(),
  body('date_sold', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const keyboardinstance = new KeyboardInstance({
      keyboard: req.body.keyboard,
      status: req.body.status,
      keyboard_switch: req.body.keyboard_switch,
      date_sold: req.body.date_sold,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Keyboard.find({}, 'display_name').exec(function (err, keyboards) {
        if (err) {
          return next(err);
        }
        KeyboardSwitch.find({}, 'display_name').exec((err, switches) => {
          if (err) {
            return next(err);
          }
          res.render('instance_form', {
            title: 'Create New Instance',
            keyboard_list: keyboards,
            selected_keyboard: keyboardinstance.keyboard._id.toString(),
            selected_switch: keyboardinstance.switch._id.toString(),
            keyboard_switch_list: switches,
            errors: errors.array(),
            keyboardinstance,
          });
        });
        return;
      });
    }

    // Data from form is valid.
    keyboardinstance.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new record.
      res.redirect(keyboardinstance.url);
    });
  },
];

// Display Keyboardinstance delete form on GET.
exports.keyboardinstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      keyboard_instance(callback) {
        KeyboardInstance.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_instance == null) {
        // No results.
        res.redirect('/inventory/instances');
      }
      // Successful, so render.
      res.render('instance_delete', {
        title: 'Delete an Instance',
        keyboard_instance: results.keyboard_instance,
      });
    }
  );
};

// Handle Keyboardinstance delete on POST.
exports.keyboardinstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      keyboard_instance(callback) {
        KeyboardInstance.findById(req.body.keyboard_instance_id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      KeyboardInstance.findByIdAndRemove(
        req.body.keyboard_instance_id,
        (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to full list
          res.redirect('/inventory/instances');
        }
      );
    }
  );
};

// Display Keyboardinstance update form on GET.
exports.keyboardinstance_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      keyboard_instance(callback) {
        KeyboardInstance.findById(req.params.id)
          .populate('keyboard_switch')
          .populate('keyboard')
          .exec(callback);
      },
      keyboards(callback) {
        Keyboard.find(callback);
      },
      switches(callback) {
        KeyboardSwitch.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_instance == null) {
        // No results.
        const err = new Error('Instance not found');
        err.status = 404;
        return next(err);
      }
      res.render('instance_form', {
        title: 'Update Instance',
        keyboardinstance: results.keyboard_instance,
        keyboard_list: results.keyboards,
        keyboard_switch_list: results.switches,
        selected_keyboard: results.keyboard_instance.keyboard._id.toString(),
        selected_switch:
          results.keyboard_instance.keyboard_switch._id.toString(),
      });
    }
  );
};

// Handle keyboardinstance update on POST.
exports.keyboardinstance_update_post = [
  // Validate and sanitize fields.
  body('keyboard', 'Keyboard must be specified')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('status').escape(),
  body('keyboard_switch', 'Specify a switch type').trim().escape(),
  body('date_sold', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const date_sold = req.body.status !== 'Sold' ? '' : req.body.date_sold;

    // Create a Book object with escaped/trimmed data and old id.
    const keyboardinstance = new KeyboardInstance({
      keyboard: req.body.keyboard,
      status: req.body.status,
      keyboard_switch: req.body.keyboard_switch,
      date_sold,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          keyboard_instance(callback) {
            KeyboardInstance.findById(req.params.id)
              .populate('keyboard_switch')
              .populate('keyboard')
              .exec(callback);
          },
          keyboards(callback) {
            Keyboard.find(callback);
          },
          switches(callback) {
            KeyboardSwitch.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          res.render('instance_form', {
            title: 'Update Instance',
            keyboardinstance,
            keyboard_list: results.keyboards,
            keyboard_switch_list: results.switches,
            selected_keyboard:
              results.keyboard_instance.keyboard._id.toString(),
            selected_switch:
              results.keyboard_instance.keyboard_switch._id.toString(),
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    KeyboardInstance.findByIdAndUpdate(
      req.params.id,
      keyboardinstance,
      {},
      (err, theinstance) => {
        if (err) {
          return next(err);
        }

        // Successful: redirect to book detail page.
        res.redirect(theinstance.url);
      }
    );
  },
];
