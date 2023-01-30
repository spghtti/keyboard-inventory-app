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
  body('description').trim().optional({ checkFalsy: true }).escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const brand = new Brand({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      origin: req.body.origin,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('brand_form', {
        title: 'Create New Brand',
        brand: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Switch with same name already exists.
      Brand.findOne({ name: req.body.name.toLowerCase() }).exec(
        (err, found_brand) => {
          if (err) {
            return next(err);
          }

          if (found_brand) {
            // Switch exists, redirect to its detail page.
            res.redirect(found_brand.url);
          } else {
            brand.save((err) => {
              if (err) {
                return next(err);
              }
              // Switch saved. Redirect to switch detail page.
              res.redirect(brand.url);
            });
          }
        }
      );
    }
  },
];

// Display Brand delete form on GET.
exports.brand_delete_get = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_keyboards(callback) {
        Keyboard.find({ brand: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results.
        res.redirect('/catalog/brands');
      }
      // Successful, so render.
      res.render('brand_delete', {
        title: 'Delete a Brand',
        brand: results.brand,
        brand_keyboards: results.brand_keyboards,
      });
    }
  );
};

// Handle Brand delete on POST.
exports.brand_delete_post = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.body.brandid).exec(callback);
      },
      brand_keyboards(callback) {
        Keyboard.find({ brand: req.body.brandid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.brand_keyboards.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render('brand_delete', {
          title: 'Delete a Brand',
          brand: results.brand,
          brand_keyboards: results.brand_keyboards,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      Brand.findByIdAndRemove(req.body.brandid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect('/inventory/brands');
      });
    }
  );
};

// Display Brand update form on GET.
exports.brand_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      console.log(results.brand);
      if (results.brand == null) {
        // No results.
        const err = new Error('Brand not found');
        err.status = 404;
        return next(err);
      }
      res.render('brand_form', {
        title: 'Update Brand',
        brand: results.brand,
      });
    }
  );
};

// Handle Brand update on POST.
exports.brand_update_post = [
  // Validate and sanitize fields.
  body('name', 'Name must at least 3 characters.')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('origin', 'Origin must be under 100 characters.')
    .trim()
    .isLength({ max: 100 })
    .escape(),
  body('description', 'Description must be under 500 characters.')
    .trim()
    .isLength({ max: 500 })
    .optional({ checkFalsy: true })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const brand = new Brand({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      origin: req.body.origin,
      description: req.body.description,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      res.render('brand_form', {
        title: 'Update Brand',
        brand,
        errors: errors.array(),
      });
      return;
    }

    // Data from form is valid. Update the record.
    Brand.findByIdAndUpdate(req.params.id, brand, {}, (err, thebrand) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(thebrand.url);
    });
  },
];
