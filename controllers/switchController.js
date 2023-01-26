const KeyboardSwitch = require('../models/keyboardswitch');
const KeyboardInstance = require('../models/keyboardinstance');
const async = require('async');

const { body, validationResult } = require('express-validator');

// Display list of all Keyboardswitch.
exports.keyboardswitch_list = (req, res) => {
  KeyboardSwitch.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_switches) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('switch_list', {
        title: 'Switch List',
        switch_list: list_switches,
      });
    });
};

// Display detail page for a specific Keyboardswitch.
exports.keyboardswitch_detail = (req, res, next) => {
  async.parallel(
    {
      keyboard_switch(callback) {
        KeyboardSwitch.findById(req.params.id).exec(callback);
      },

      switch_instances(callback) {
        KeyboardInstance.find({ keyboard_switch: req.params.id })
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
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_switch == null) {
        // No results.
        const err = new Error('Switch not found');
        err.status = 404;
        return next(err);
      }
      if (results.switch_instances == null) {
        // No results.
        const err = new Error('Switch Instances not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('switch_detail', {
        title: 'Switch Detail',
        keyboard_switch: results.keyboard_switch,
        switch_instances: results.switch_instances,
      });
    }
  );
};

// Display Keyboardswitch create form on GET.
exports.keyboardswitch_create_get = (req, res, next) => {
  res.render('switch_form', {
    title: 'Create New Switch',
  });
};

// Handle Keyboardswitch create on POST.
exports.keyboardswitch_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Switch name must be at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('description', 'Description name must be at least 3 characters')
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const keyboard_switch = new KeyboardSwitch({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('switch_form', {
        title: 'Create New Switch',
        keyboard_switch,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Switch with same name already exists.
      KeyboardSwitch.findOne({ name: req.body.name.toLowerCase() }).exec(
        (err, found_switch) => {
          if (err) {
            return next(err);
          }

          if (found_switch) {
            // Switch exists, redirect to its detail page.
            res.redirect(found_switch.url);
          } else {
            keyboard_switch.save((err) => {
              if (err) {
                return next(err);
              }
              // Switch saved. Redirect to switch detail page.
              res.redirect(keyboard_switch.url);
            });
          }
        }
      );
    }
  },
];
// Display Keyboardswitch delete form on GET.
exports.keyboardswitch_delete_get = (req, res, next) => {
  async.parallel(
    {
      keyboard_switch(callback) {
        KeyboardSwitch.findById(req.params.id).exec(callback);
      },
      switch_instances(callback) {
        KeyboardInstance.find({ keyboard_switch: req.params.id })
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
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_switch == null) {
        // No results.
        res.redirect('/inventory/switches');
      }
      // Successful, so render.
      res.render('switch_delete', {
        title: 'Delete a Switch',
        keyboard_switch: results.keyboard_switch,
        switch_instances: results.switch_instances,
      });
    }
  );
};

// Handle Keyboardswitch delete on POST.
exports.keyboardswitch_delete_post = (req, res, next) => {
  async.parallel(
    {
      keyboard_switch(callback) {
        KeyboardSwitch.findById(req.body.keyboard_switch_id).exec(callback);
      },
      switch_instances(callback) {
        KeyboardInstance.find({
          keyboard_switch: req.body.keyboard_switch_id,
        }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.switch_instances.length > 0) {
        // Keyboard has books. Render in same way as for GET route.
        res.render('switch_delete', {
          title: 'Delete a Switch',
          keyboard_switch: results.keyboard_switch,
          switch_instances: results.switch_instances,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      KeyboardSwitch.findByIdAndRemove(req.body.keyboard_switch_id, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect('/inventory/switches');
      });
    }
  );
};

// Display Keyboardswitch update form on GET.
exports.keyboardswitch_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch update GET');
};

// Handle Keyboardswitch update on POST.
exports.keyboardswitch_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch update POST');
};
