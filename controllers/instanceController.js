const KeyboardInstance = require('../models/keyboardinstance');
const Keyboard = require('../models/keyboard');
const KeyboardSwitch = require('../models/keyboardswitch');

const async = require('async');

const { body, validationResult } = require('express-validator');

exports.keyboardinstance_list = (req, res, next) => {
  KeyboardInstance.find({
    sort: {
      // prettier-ignore
      'status': 1,
    },
  })
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
      list_keyboardinstances.sort(function (a, b) {
        let statusA = a.status;
        let statusB = b.status;
        let brandA = a.keyboard.brand.name;
        let brandB = b.keyboard.brand.name;

        if (statusA == statusB) {
          return brandA < brandB ? -1 : brandA < brandB ? 1 : 0;
        } else {
          return statusA < statusB ? -1 : 1;
        }
      });
      res.render('instance_list', {
        title: 'Keyboard Instance List',
        keyboardinstance_list: list_keyboardinstances,
      });
    });
};

exports.keyboardinstance_detail = (req, res, next) => {
  KeyboardInstance.findById(req.params.id)
    .populate('keyboard')
    .populate('keyboard_switch')
    .exec((err, keyboardinstance) => {
      if (err) {
        return next(err);
      }
      if (keyboardinstance == null) {
        const err = new Error('Instance not found');
        err.status = 404;
        return next(err);
      }
      console.log(keyboardinstance);
      res.render('instance_detail', {
        title: `Keyboard: ${keyboardinstance.keyboard.name}`,
        keyboardinstance,
      });
    });
};

exports.keyboardinstance_create_get = (req, res, next) => {
  Keyboard.find({}, 'name')
    .populate('brand')
    .exec((err, keyboards) => {
      if (err) {
        return next(err);
      }
      KeyboardSwitch.find({}, 'display_name').exec((err, switches) => {
        if (err) {
          return next(err);
        }
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;

        res.render('instance_form', {
          title: 'Create New Instance',
          keyboard_list: keyboards,
          keyboard_switch_list: switches,
          today,
        });
      });
    });
};

exports.keyboardinstance_create_post = [
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

  (req, res, next) => {
    const errors = validationResult(req);

    const keyboardinstance = new KeyboardInstance({
      keyboard: req.body.keyboard,
      status: req.body.status,
      keyboard_switch: req.body.keyboard_switch,
      date_sold: req.body.date_sold,
    });

    if (!errors.isEmpty()) {
      Keyboard.find({}, 'display_name').exec(function (err, keyboards) {
        if (err) {
          return next(err);
        }
        KeyboardSwitch.find({}, 'display_name').exec((err, switches) => {
          if (err) {
            return next(err);
          }

          let today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();
          today = yyyy + '-' + mm + '-' + dd;

          res.render('instance_form', {
            title: 'Create New Instance',
            keyboard_list: keyboards,
            selected_keyboard: keyboardinstance.keyboard._id.toString(),
            today,
            selected_switch: keyboardinstance.switch._id.toString(),
            keyboard_switch_list: switches,
            errors: errors.array(),
            keyboardinstance,
          });
        });
        return;
      });
    }

    keyboardinstance.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(keyboardinstance.url);
    });
  },
];

exports.keyboardinstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      keyboard_instance(callback) {
        KeyboardInstance.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_instance == null) {
        res.redirect('/inventory/instances');
      }
      res.render('instance_delete', {
        title: 'Delete an Instance',
        keyboard_instance: results.keyboard_instance,
      });
    }
  );
};

exports.keyboardinstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      keyboard_instance(callback) {
        KeyboardInstance.findById(req.body.keyboard_instance_id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      KeyboardInstance.findByIdAndRemove(
        req.body.keyboard_instance_id,
        (err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/inventory/instances');
        }
      );
    }
  );
};

exports.keyboardinstance_update_get = (req, res, next) => {
  async.parallel(
    {
      keyboard_instance(callback) {
        KeyboardInstance.findById(req.params.id)
          .populate('keyboard_switch')
          .populate('keyboard')
          .exec(callback);
      },
      keyboards(callback) {
        Keyboard.find(callback);
      },
      switches(callback) {
        KeyboardSwitch.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard_instance == null) {
        const err = new Error('Instance not found');
        err.status = 404;
        return next(err);
      }

      let today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      today = yyyy + '-' + mm + '-' + dd;

      res.render('instance_form', {
        title: 'Update Instance',
        keyboardinstance: results.keyboard_instance,
        keyboard_list: results.keyboards,
        keyboard_switch_list: results.switches,
        selected_keyboard: results.keyboard_instance.keyboard._id.toString(),
        today,
        selected_switch:
          results.keyboard_instance.keyboard_switch._id.toString(),
      });
    }
  );
};

exports.keyboardinstance_update_post = [
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
  (req, res, next) => {
    const errors = validationResult(req);

    let date_sold = req.body.date_sold;

    if (req.body.status === 'Sold') {
      let str = [...req.body.date_sold.toISOString()];
      let offsetHours = date_sold.getTimezoneOffset() / 60;
      str[str.indexOf('T') + 2] = String(offsetHours);
      date_sold = str.join('');
    } else {
      date_sold = '';
    }

    const keyboardinstance = new KeyboardInstance({
      keyboard: req.body.keyboard,
      status: req.body.status,
      keyboard_switch: req.body.keyboard_switch,
      date_sold,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          keyboard_instance(callback) {
            KeyboardInstance.findById(req.params.id)
              .populate('keyboard_switch')
              .populate('keyboard')
              .exec(callback);
          },
          keyboards(callback) {
            Keyboard.find(callback);
          },
          switches(callback) {
            KeyboardSwitch.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          let today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();
          today = yyyy + '-' + mm + '-' + dd;

          res.render('instance_form', {
            title: 'Update Instance',
            keyboardinstance,
            today,
            keyboard_list: results.keyboards,
            keyboard_switch_list: results.switches,
            selected_keyboard:
              results.keyboard_instance.keyboard._id.toString(),
            selected_switch:
              results.keyboard_instance.keyboard_switch._id.toString(),
            errors: errors.array(),
          });
        }
      );
      return;
    }
    KeyboardInstance.findByIdAndUpdate(
      req.params.id,
      keyboardinstance,
      {},
      (err, theinstance) => {
        if (err) {
          return next(err);
        }

        res.redirect(theinstance.url);
      }
    );
  },
];
