const Keyboard = require('../models/keyboard');
const Brand = require('../models/brand');
const KeyboardInstance = require('../models/keyboardinstance');
const Switch = require('../models/keyboardswitch');

const async = require('async');

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
exports.keyboard_detail = (req, res) => {
  res.send(`NOT IMPLEMENTED: Keyboard detail: ${req.params.id}`);
};

// Display keyboard create form on GET.
exports.keyboard_create_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard create GET');
};

// Handle keyboard create on POST.
exports.keyboard_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard create POST');
};

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
