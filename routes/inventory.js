const express = require('express');
const router = express.Router();

// Require controller modules.
const keyboard_controller = require('../controllers/keyboardController');
const brand_controller = require('../controllers/brandController');
const keyboardswitch_controller = require('../controllers/switchController');
const keyboard_instance_controller = require('../controllers/instanceController');

/// BOOK ROUTES ///

// GET inventory home page.
router.get('/', keyboard_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/keyboard/create', keyboard_controller.keyboard_create_get);

// POST request for creating Book.
router.post('/keyboard/create', keyboard_controller.keyboard_create_post);

// GET request to delete Book.
router.get('/keyboard/:id/delete', keyboard_controller.keyboard_delete_get);

// POST request to delete Book.
router.post('/keyboard/:id/delete', keyboard_controller.keyboard_delete_post);

// GET request to update Book.
router.get('/keyboard/:id/update', keyboard_controller.keyboard_update_get);

// POST request to update Book.
router.post('/keyboard/:id/update', keyboard_controller.keyboard_update_post);

// GET request for one Book.
router.get('/keyboard/:id', keyboard_controller.keyboard_detail);

// GET request for list of all Book items.
router.get('/keyboards', keyboard_controller.keyboard_list);

/// AUTHOR ROUTES ///

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

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get(
  '/switch/create',
  keyboardswitch_controller.keyboardswitch_create_get
);

//POST request for creating Genre.
router.post(
  '/switch/create',
  keyboardswitch_controller.keyboardswitch_create_post
);

// GET request to delete Genre.
router.get(
  '/switch/:id/delete',
  keyboardswitch_controller.keyboardswitch_delete_get
);

// POST request to delete Genre.
router.post(
  '/switch/:id/delete',
  keyboardswitch_controller.keyboardswitch_delete_post
);

// GET request to update Genre.
router.get(
  '/switch/:id/update',
  keyboardswitch_controller.keyboardswitch_update_get
);

// POST request to update Genre.
router.post(
  '/switch/:id/update',
  keyboardswitch_controller.keyboardswitch_update_post
);

// GET request for one Genre.
router.get('/switch/:id', keyboardswitch_controller.keyboardswitch_detail);

// GET request for list of all Genre.
router.get('/switches', keyboardswitch_controller.keyboardswitch_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get(
  '/instance/create',
  keyboard_instance_controller.keyboardinstance_create_get
);

// POST request for creating BookInstance.
router.post(
  '/instance/create',
  keyboard_instance_controller.keyboardinstance_create_post
);

// GET request to delete BookInstance.
router.get(
  '/instance/:id/delete',
  keyboard_instance_controller.keyboardinstance_delete_get
);

// POST request to delete BookInstance.
router.post(
  '/instance/:id/delete',
  keyboard_instance_controller.keyboardinstance_delete_post
);

// GET request to update BookInstance.
router.get(
  '/instance/:id/update',
  keyboard_instance_controller.keyboardinstance_update_get
);

// POST request to update BookInstance.
router.post(
  '/instance/:id/update',
  keyboard_instance_controller.keyboardinstance_update_post
);

// GET request for one BookInstance.
router.get(
  '/instance/:id',
  keyboard_instance_controller.keyboardinstance_detail
);

// GET request for list of all BookInstance.
router.get('/instances', keyboard_instance_controller.keyboardinstance_list);

module.exports = router;
