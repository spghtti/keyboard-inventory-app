const KeyboardSwitch = require('../models/keyboardswitch');
const KeyboardInstance = require('../models/keyboardinstance');
const async = require('async');

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
        KeyboardInstance.find({ keyboard_switch: req.params.id }).exec(
          callback
        );
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
exports.keyboardswitch_create_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch create GET');
};

// Handle Keyboardswitch create on POST.
exports.keyboardswitch_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch create POST');
};

// Display Keyboardswitch delete form on GET.
exports.keyboardswitch_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch delete GET');
};

// Handle Keyboardswitch delete on POST.
exports.keyboardswitch_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch delete POST');
};

// Display Keyboardswitch update form on GET.
exports.keyboardswitch_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch update GET');
};

// Handle Keyboardswitch update on POST.
exports.keyboardswitch_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardswitch update POST');
};
