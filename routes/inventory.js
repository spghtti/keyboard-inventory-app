const express = require('express');
const router = express.Router();

// Require controller modules.
const keyboard_controller = require('../controllers/keyboardController');
const brand_controller = require('../controllers/brandController');
const keyboardswitch_controller = require('../controllers/switchController');
const keyboard_instance_controller = require('../controllers/instanceController');

/// KEYBOARD ROUTES ///

// GET inventory home page.
router.get('/', keyboard_controller.index);

// GET request for creating a Keyboard. NOTE This must come before routes that display Keyboard (uses id).
router.get('/keyboard/create', keyboard_controller.keyboard_create_get);

// POST request for creating Keyboard.
router.post('/keyboard/create', keyboard_controller.keyboard_create_post);

// GET request to delete Keyboard.
router.get('/keyboard/:id/delete', keyboard_controller.keyboard_delete_get);

// POST request to delete Keyboard.
router.post('/keyboard/:id/delete', keyboard_controller.keyboard_delete_post);

// GET request to update Keyboard.
router.get('/keyboard/:id/update', keyboard_controller.keyboard_update_get);

// POST request to update Keyboard.
router.post('/keyboard/:id/update', keyboard_controller.keyboard_update_post);

// GET request for one Keyboard.
router.get('/keyboard/:id', keyboard_controller.keyboard_detail);

// GET request for list of all Keyboard items.
router.get('/keyboards', keyboard_controller.keyboard_list);

/// BRAND ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display brand).
router.get('/brand/create', brand_controller.brand_create_get);

// POST request for creating Author.
router.post('/brand/create', brand_controller.brand_create_post);

// GET request to delete Author.
router.get('/brand/:id/delete', brand_controller.brand_delete_get);

// POST request to delete Author.
router.post('/brand/:id/delete', brand_controller.brand_delete_post);

// GET request to update Author.
router.get('/brand/:id/update', brand_controller.brand_update_get);

// POST request to update Author.
router.post('/brand/:id/update', brand_controller.brand_update_post);

// GET request for one Author.
router.get('/brand/:id', brand_controller.brand_detail);

// GET request for list of all Authors.
router.get('/brands', brand_controller.brand_list);

/// SWITCH ROUTES ///

// GET request for creating a Switch. NOTE This must come before route that displays Switch (uses id).
router.get(
  '/switch/create',
  keyboardswitch_controller.keyboardswitch_create_get
);

//POST request for creating Switch.
router.post(
  '/switch/create',
  keyboardswitch_controller.keyboardswitch_create_post
);

// GET request to delete Switch.
router.get(
  '/switch/:id/delete',
  keyboardswitch_controller.keyboardswitch_delete_get
);

// POST request to delete Switch.
router.post(
  '/switch/:id/delete',
  keyboardswitch_controller.keyboardswitch_delete_post
);

// GET request to update Switch.
router.get(
  '/switch/:id/update',
  keyboardswitch_controller.keyboardswitch_update_get
);

// POST request to update Switch.
router.post(
  '/switch/:id/update',
  keyboardswitch_controller.keyboardswitch_update_post
);

// GET request for one Switch.
router.get('/switch/:id', keyboardswitch_controller.keyboardswitch_detail);

// GET request for list of all Switch.
router.get('/switches', keyboardswitch_controller.keyboardswitch_list);

/// INSTANCE ROUTES ///

// GET request for creating a Keyboard Instance. NOTE This must come before route that displays KeyboardInstance (uses id).
router.get(
  '/instance/create',
  keyboard_instance_controller.keyboardinstance_create_get
);

// POST request for creating Keyboard Instance.
router.post(
  '/instance/create',
  keyboard_instance_controller.keyboardinstance_create_post
);

// GET request to delete Keyboard Instance.
router.get(
  '/instance/:id/delete',
  keyboard_instance_controller.keyboardinstance_delete_get
);

// POST request to delete Keyboard Instance.
router.post(
  '/instance/:id/delete',
  keyboard_instance_controller.keyboardinstance_delete_post
);

// GET request to update Keyboard Instance.
router.get(
  '/instance/:id/update',
  keyboard_instance_controller.keyboardinstance_update_get
);

// POST request to update Keyboard Instance.
router.post(
  '/instance/:id/update',
  keyboard_instance_controller.keyboardinstance_update_post
);

// GET request for one Keyboard Instance.
router.get(
  '/instance/:id',
  keyboard_instance_controller.keyboardinstance_detail
);

// GET request for list of all Keyboard Instances.
router.get('/instances', keyboard_instance_controller.keyboardinstance_list);

module.exports = router;
