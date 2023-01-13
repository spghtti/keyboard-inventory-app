const KeyboardInstance = require('../models/keyboardinstance');

// Display list of all Keyboardinstances.
exports.keyboardinstance_list = (req, res, next) => {
  KeyboardInstance.find()
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
      // Successful, so render
      res.render('instance_list', {
        title: 'Keyboard Instance List',
        keyboardinstance_list: list_keyboardinstances,
      });
    });
};

// Display detail page for a specific Keyboardinstance.
exports.keyboardinstance_detail = (req, res, next) => {
  KeyboardInstance.findById(req.params.id)
    .populate('keyboard')
    .exec((err, keyboardinstance) => {
      if (err) {
        return next(err);
      }
      if (keyboardinstance == null) {
        // No results.
        const err = new Error('Instance not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('instance_detail', {
        title: `Keyboard: ${keyboardinstance.keyboard.name}`,
        keyboardinstance,
      });
    });
};

// Display Keyboardinstance create form on GET.
exports.keyboardinstance_create_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance create GET');
};

// Handle Keyboardinstance create on POST.
exports.keyboardinstance_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance create POST');
};

// Display Keyboardinstance delete form on GET.
exports.keyboardinstance_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance delete GET');
};

// Handle Keyboardinstance delete on POST.
exports.keyboardinstance_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance delete POST');
};

// Display Keyboardinstance update form on GET.
exports.keyboardinstance_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance update GET');
};

// Handle keyboardinstance update on POST.
exports.keyboardinstance_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Keyboardinstance update POST');
};
