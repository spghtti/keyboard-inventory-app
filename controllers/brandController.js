const Brand = require('../models/brand');
const Keyboard = require('../models/keyboard');
const async = require('async');

const { body, validationResult } = require('express-validator');

// Display list of all Brand.
exports.brand_list = (req, res, next) => {
  Brand.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_brands) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('brand_list', {
        title: 'Brand List',
        brand_list: list_brands,
      });
    });
};

// Display detail page for a specific Brand.
exports.brand_detail = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_keyboards(callback) {
        Keyboard.find({ brand: req.params.id }, 'name description').exec(
          callback
        );
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.brand == null) {
        // No results.
        const err = new Error('Brand not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('brand_detail', {
        title: 'Brand',
        brand: results.brand,
        brand_keyboards: results.brand_keyboards,
      });
    }
  );
};

// Display Brand create form on GET.
exports.brand_create_get = (req, res, next) => {
  res.render('brand_form', { title: 'Create New Brand' });
};

// Handle Brand create on POST.
exports.brand_create_post = [
  // Validate and sanitize fields.
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters.')
    .escape(),
  body('origin').trim().optional({ checkFalsy: true }).escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('brand_form', {
        title: 'Create New Brand',
        brand: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Author object with escaped and trimmed data.
    const brand = new Brand({
      name: req.body.name,
      origin: req.body.origin,
    });
    brand.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new brand record.
      res.redirect(brand.url);
    });
  },
];

// Display Brand delete form on GET.
exports.brand_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Brand delete GET');
};

// Handle Brand delete on POST.
exports.brand_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Brand delete POST');
};

// Display Brand update form on GET.
exports.brand_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Brand update GET');
};

// Handle Brand update on POST.
exports.brand_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Brand update POST');
};
