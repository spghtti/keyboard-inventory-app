const KeyboardSwitch = require('../models/keyboardswitch');
const KeyboardInstance = require('../models/keyboardinstance');
const async = require('async');

const { body, validationResult } = require('express-validator');

exports.keyboardswitch_list = (req, res) => {
  KeyboardSwitch.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_switches) {
      if (err) {
        return next(err);
      }
      res.render('switch_list', {
        title: 'Switch List',
        switch_list: list_switches,
      });
    });
};

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
        const err = new Error('Switch not found');
        err.status = 404;
        return next(err);
      }
      if (results.switch_instances == null) {
        const err = new Error('Switch Instances not found');
        err.status = 404;
        return next(err);
      }
      res.render('switch_detail', {
        title: 'Switch Detail',
        keyboard_switch: results.keyboard_switch,
        switch_instances: results.switch_instances,
      });
    }
  );
};

exports.keyboardswitch_create_get = (req, res, next) => {
  res.render('switch_form', {
    title: 'Create New Switch',
  });
};

exports.keyboardswitch_create_post = [
  body('name', 'Switch name must be at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('description', 'Description name must be at least 3 characters')
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const keyboard_switch = new KeyboardSwitch({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('switch_form', {
        title: 'Create New Switch',
        keyboard_switch,
        errors: errors.array(),
      });
      return;
    } else {
      KeyboardSwitch.findOne({ name: req.body.name.toLowerCase() }).exec(
        (err, found_switch) => {
          if (err) {
            return next(err);
          }

          if (found_switch) {
            res.redirect(found_switch.url);
          } else {
            keyboard_switch.save((err) => {
              if (err) {
                return next(err);
              }
              res.redirect(keyboard_switch.url);
            });
          }
        }
      );
    }
  },
];
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
        res.redirect('/inventory/switches');
      }
      res.render('switch_delete', {
        title: 'Delete a Switch',
        keyboard_switch: results.keyboard_switch,
        switch_instances: results.switch_instances,
      });
    }
  );
};

exports.keyboardswitch_delete_post = (req, res, next) => {
  async.parallel(
    {
      keyboard_switch(callback) {
        KeyboardSwitch.findById(req.body.keyboard_switch_id).exec(callback);
      },
      switch_instances(callback) {
        KeyboardInstance.find(
          {
            keyboard_switch: req.body.keyboard_switch_id,
          }.populate({
            path: 'keyboard',
            model: 'Keyboard',
            populate: [
              {
                path: 'brand',
                model: 'Brand',
              },
            ],
          })
        ).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.switch_instances.length > 0) {
        res.render('switch_delete', {
          title: 'Delete a Switch',
          keyboard_switch: results.keyboard_switch,
          switch_instances: results.switch_instances,
        });
        return;
      }
      KeyboardSwitch.findByIdAndRemove(req.body.keyboard_switch_id, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/inventory/switches');
      });
    }
  );
};

exports.keyboardswitch_update_get = (req, res, next) => {
  async.parallel(
    {
      keyboard_switch(callback) {
        KeyboardSwitch.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_switch == null) {
        const err = new Error('Switch not found');
        err.status = 404;
        return next(err);
      }
      res.render('switch_form', {
        title: 'Update Switch',
        keyboard_switch: results.keyboard_switch,
      });
    }
  );
};

exports.keyboardswitch_update_post = [
  body('name', 'Name must be between 3 and 100 characters.')
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body('description', 'Description must be under 500 characters.')
    .trim()
    .isLength({ max: 500 })
    .optional({ checkFalsy: true })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const keyboard_switch = new KeyboardSwitch({
      name: req.body.name.toLowerCase(),
      display_name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('switch_form', {
        title: 'Update Switch',
        keyboard_switch,
        errors: errors.array(),
      });
      return;
    }

    KeyboardSwitch.findByIdAndUpdate(
      req.params.id,
      keyboard_switch,
      {},
      (err, theswitch) => {
        if (err) {
          return next(err);
        }

        res.redirect(theswitch.url);
      }
    );
  },
];
