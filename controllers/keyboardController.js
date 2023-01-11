const Keyboard = require('../models/keyboard');

exports.index = (req, res) => {
  res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all keyboards.
exports.keyboard_list = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboard list');
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
