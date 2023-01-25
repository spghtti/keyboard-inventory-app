const KeyboardInstance = require('../models/keyboardinstance');
const Keyboard = require('../models/keyboard');
const KeyboardSwitch = require('../models/keyboardswitch');

const { body, validationResult } = require('express-validator');

// Display list of all Keyboardinstances.
exports.keyboardinstance_list = (req, res, next) => {
  KeyboardInstance.find()
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
      // Successful, so render.
      res.render('instance_detail', {
        title: `Keyboard: ${keyboardinstance.keyboard.name}`,
        keyboardinstance,
      });
    });
};

// Display Keyboardinstance create form on GET.
exports.keyboardinstance_create_get = (req, res, next) => {
  Keyboard.find({}, 'name').exec((err, keyboards) => {
    if (err) {
      return next(err);
    }
    KeyboardSwitch.find({}, 'display_name').exec((err, switches) => {
      if (err) {
        return next(err);
      }
      console.log(switches);
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
            selected_keyboard: keyboardinstance.keyboard._id,
            selected_switch: keyboardinstance.switch._id,
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
exports.keyboardinstance_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance delete GET');
};

// Handle Keyboardinstance delete on POST.
exports.keyboardinstance_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance delete POST');
};

// Display Keyboardinstance update form on GET.
exports.keyboardinstance_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance update GET');
};

// Handle keyboardinstance update on POST.
exports.keyboardinstance_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance update POST');
};
