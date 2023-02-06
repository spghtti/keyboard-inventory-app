const Keyboard = require('../models/keyboard');
const Brand = require('../models/brand');
const KeyboardInstance = require('../models/keyboardinstance');
const Switch = require('../models/keyboardswitch');

const async = require('async');
const { body, validationResult } = require('express-validator');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
  async.parallel(
    {
      keyboard_count(callback) {
        Keyboard.countDocuments({}, callback);
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
      res.render('keyboard_list', {
        title: 'All Keyboards',
        keyboard_list: list_keyboards,
      });
    });
};

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
      if (err) {
        return next(err);
      }
      if (results.keyboard == null) {
        const err = new Error('Keyboard not found');
        err.status = 404;
        return next(err);
      }
      res.render('keyboard_detail', {
        title: results.keyboard.name,
        keyboard: results.keyboard,
        keyboard_instances: results.keyboard_instances,
      });
    }
  );
};

exports.keyboard_create_get = (req, res, next) => {
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.keyboard_create_post = [
  upload.single('image'),
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
  (req, res, next) => {
    const errors = validationResult(req);

    let image = null;

    const validFiles = ['image/png', 'image/jpeg', 'image/jpg'];
    let fileError = { msg: '' };

    if (req.file) {
      if (validFiles.indexOf(req.file.mimetype) !== -1) {
        image = {
          data: req.file.buffer,
          contentType: 'image/png',
        };
      } else {
        fileError = { msg: 'Image must be a png, jpg, or jpeg' };
      }
    }

    const keyboard = new Keyboard({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      image,
    });

    if (!errors.isEmpty()) {
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
          const errorsArr = errors.array();
          errorsArr.push(fileError);
          res.render('keyboard_form', {
            title: 'Create New Keyboard',
            brands: results.brands,
            keyboard,
            errors: errorsArr,
          });
        }
      );
      return;
    }

    keyboard.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(keyboard.url);
    });
  },
];

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
      if (err) {
        return next(err);
      }
      if (results.keyboard == null) {
        res.redirect('/inventory/keyboards');
      }
      res.render('keyboard_delete', {
        title: 'Delete a Keyboard',
        keyboard: results.keyboard,
        keyboard_instances: results.keyboard_instances,
      });
    }
  );
};

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
      if (err) {
        return next(err);
      }
      if (results.keyboard_instances.length > 0) {
        res.render('switch_delete', {
          title: 'Delete a Switch',
          keyboard: results.keyboard,
          keyboard_instances: results.keyboard_instances,
        });
        return;
      }
      Keyboard.findByIdAndRemove(req.body.keyboard_id, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/inventory/keyboards');
      });
    }
  );
};

exports.keyboard_update_get = (req, res, next) => {
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

exports.keyboard_update_post = [
  upload.single('image'),
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
  (req, res, next) => {
    const errors = validationResult(req);
    let image = null;

    const validFiles = ['image/png', 'image/jpeg', 'image/jpg'];
    let fileError = { msg: '' };

    if (req.file) {
      if (validFiles.indexOf(req.file.mimetype) !== -1) {
        image = {
          data: req.file.buffer,
          contentType: 'image/png',
        };
      } else {
        fileError = { msg: 'Image must be a png, jpg, or jpeg' };
      }
    }

    const keyboard = new Keyboard({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      image,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
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
          const errorsArr = errors.array();
          errorsArr.push(fileError);
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

    Keyboard.findByIdAndUpdate(
      req.params.id,
      keyboard,
      {},
      (err, thekeyboard) => {
        if (err) {
          return next(err);
        }

        res.redirect(thekeyboard.url);
      }
    );
  },
];
