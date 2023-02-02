const Brand = require('../models/brand');
const Keyboard = require('../models/keyboard');
const async = require('async');

const { body, validationResult } = require('express-validator');

exports.brand_list = (req, res, next) => {
  Brand.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_brands) {
      if (err) {
        return next(err);
      }
      res.render('brand_list', {
        title: 'Brand List',
        brand_list: list_brands,
      });
    });
};

exports.brand_detail = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_keyboards(callback) {
        Keyboard.find({ brand: req.params.id }, 'name description price').exec(
          callback
        );
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        const err = new Error('Brand not found');
        err.status = 404;
        return next(err);
      }
      res.render('brand_detail', {
        title: 'Brand',
        brand: results.brand,
        brand_keyboards: results.brand_keyboards,
      });
    }
  );
};

exports.brand_create_get = (req, res, next) => {
  res.render('brand_form', { title: 'Create New Brand' });
};

exports.brand_create_post = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters.')
    .escape(),
  body('origin')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('Origin must be under 100 characters.')
    .escape(),
  body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters.')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const brand = new Brand({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      origin: req.body.origin,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('brand_form', {
        title: 'Create New Brand',
        brand: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      Brand.findOne({ name: req.body.name.toLowerCase() }).exec(
        (err, found_brand) => {
          if (err) {
            return next(err);
          }

          if (found_brand) {
            res.redirect(found_brand.url);
          } else {
            brand.save((err) => {
              if (err) {
                return next(err);
              }
              res.redirect(brand.url);
            });
          }
        }
      );
    }
  },
];

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
        res.redirect('/catalog/brands');
      }
      res.render('brand_delete', {
        title: 'Delete a Brand',
        brand: results.brand,
        brand_keyboards: results.brand_keyboards,
      });
    }
  );
};

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
      if (results.brand_keyboards.length > 0) {
        res.render('brand_delete', {
          title: 'Delete a Brand',
          brand: results.brand,
          brand_keyboards: results.brand_keyboards,
        });
        return;
      }
      Brand.findByIdAndRemove(req.body.brandid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/inventory/brands');
      });
    }
  );
};

exports.brand_update_get = (req, res, next) => {
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
      if (results.brand == null) {
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

exports.brand_update_post = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters.')
    .escape(),
  body('origin')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('Origin must be under 100 characters.')
    .escape(),
  body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters.')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const brand = new Brand({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      origin: req.body.origin,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('brand_form', {
        title: 'Update Brand',
        brand,
        errors: errors.array(),
      });
      return;
    }

    Brand.findByIdAndUpdate(req.params.id, brand, {}, (err, thebrand) => {
      if (err) {
        return next(err);
      }

      res.redirect(thebrand.url);
    });
  },
];
