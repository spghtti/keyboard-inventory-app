#! /usr/bin/env node

// console.log(
//   'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
// );

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Brand = require('./models/brand');
var Keyboard = require('./models/keyboard');
var KeyboardInstance = require('./models/keyboardinstance');
var KeyboardSwitch = require('./models/keyboardswitch');

var mongoose = require('mongoose');
const keyboard = require('./models/keyboard');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var brands = [];
var keyboards = [];
var keyboardinstances = [];
var keyboardswitches = [];

function brandCreate(name, display_name, origin, cb) {
  branddetail = { name, display_name, origin };
  if (origin != false) branddetail.origin = origin;

  var brand = new Brand(branddetail);

  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Brand: ' + brand);
    brands.push(brand);
    cb(null, brand);
  });
}

function switchCreate(name, display_name, description, cb) {
  switchDetail = { name, display_name };

  if (description != false) switchDetail.description = description;

  var keyboardSwitch = new KeyboardSwitch(switchDetail);

  keyboardSwitch.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Switch: ' + keyboardSwitch);
    keyboardswitches.push(keyboardSwitch);
    cb(null, keyboardSwitch);
  });
}

function keyboardCreate(name, brand, description, price, switches, cb) {
  keyboarddetail = {
    name,
    brand,
    description,
    price,
    switches,
  };
  if (description != false) keyboarddetail.description = description;

  var keyboard = new Keyboard(keyboarddetail);

  keyboard.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Keyboard: ' + keyboard);
    keyboards.push(keyboard);
    cb(null, keyboard);
  });
}

function keyboardInstanceCreate(
  keyboard,
  status,
  keyboard_switch,
  date_sold,
  cb
) {
  keyboardinstancedetail = {
    keyboard,
    status,
    keyboard_switch,
  };
  if (date_sold != false) keyboardinstancedetail.date_sold = date_sold;
  if (status != false) keyboardinstancedetail.status = status;

  var keyboardinstance = new KeyboardInstance(keyboardinstancedetail);
  keyboardinstance.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New KeyboardInstance: ' + keyboardinstance);
    keyboardinstances.push(keyboardinstance);
    cb(null, keyboardinstance);
  });
}

function createSwitchesBrands(cb) {
  async.series(
    [
      function (callback) {
        brandCreate('ducky', 'Ducky', 'United States', callback);
      },
      function (callback) {
        brandCreate('hhkb', 'HHKB', false, callback);
      },
      function (callback) {
        brandCreate('leopold', 'Leopold', 'Korea', callback);
      },
      function (callback) {
        brandCreate('vortex', 'Vortex', 'Taiwan', callback);
      },
      function (callback) {
        switchCreate(
          'topre',
          'Topre',
          'Topre switches are an electro-capacitive switch that actuates via the Hall effect. Topre switches have the feel of a rubber dome but add in the nice aspects of mechanical keyboards as well. They have a nice “thonk” sound and satisfying tactile feedback. Topre is an awesome alternative to mechanical switches if you enjoy a slightly different feel, although you have to pay quite a bit more for Topre switches',
          callback
        );
      },
      function (callback) {
        switchCreate(
          'Cherry MX Red',
          'cherry mx red',
          'The linear switching characteristic combined with the low spring resistance triggers directly. The CHERRY MX Red is the first choice for beginners in the world of mechanical keyboards. The smooth-running CHERRY MX technology enables balanced writing and gaming sessions.',
          callback
        );
      },
      function (callback) {
        switchCreate('Cherry MX Blue', 'cherry mx blue', false, callback);
      },
    ],
    // optional callback
    cb
  );
}

function createKeyboards(cb) {
  async.parallel(
    [
      function (callback) {
        keyboardCreate(
          'One 2',
          brands[0],
          'Featuring PBT double shot seamless keycaps with side laser engraving technique. Smaller size, but no functions sacrificed. Supports Ducky Macro V2.0 and Mouse control function. The new bezel design shares a similar sleek frame as its predecessor, but the One 2 Mini incorporates dual colors on the bezel to match all varieties of keycap colorways.',
          130,
          [keyboardswitches[0], keyboardswitches[1]],
          callback
        );
      },
      function (callback) {
        keyboardCreate(
          'Classic',
          brands[1],
          'Designed by programmers for programmers to improve speed, accuracy and reduce hand and finger fatigue -hand never need to leave the home row.',
          145,
          [keyboardswitches[0], keyboardswitches[2]],
          callback
        );
      },
      function (callback) {
        keyboardCreate(
          'FC750R',
          brands[2],
          false,
          153,
          [keyboardswitches[1], keyboardswitches[2]],
          callback
        );
      },
      function (callback) {
        keyboardCreate(
          'Race 3',
          brands[2],
          "Vortex's newest 75% keyboard, the 83-key Race 3! Do you need dedicated arrow keys that your 60% doesn't provide, but don't want the size of a TKL? A 75% may be just for you! Most of the keys are in the \"normal\" spot, so there's nearly no learning curve for this keyboard.",
          110,
          [keyboardswitches[0]],
          callback
        );
      },
      function (callback) {
        keyboardCreate(
          'Hybrid Type-S',
          brands[1],
          'The HHKB Hybrid Type-S comes with full key map customization software as well as 6 DIP switches to customize user experience. Includes 3 adjustable keyboard heights for optimum comfort..',
          137,
          [keyboardswitches[0]],
          callback
        );
      },
      function (callback) {
        keyboardCreate(
          'Test Keyboard 1',
          brands[1],
          false,
          99,
          [keyboardswitches[1], keyboardswitches[2]],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createKeyboardInstances(cb) {
  async.parallel(
    [
      function (callback) {
        keyboardInstanceCreate(
          keyboards[0],
          'In-stock',
          keyboardswitches[2],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[1],
          'In-stock',
          keyboardswitches[0],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[3],
          'Sold',
          keyboardswitches[0],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[4],
          'In-stock',
          keyboardswitches[1],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[5],
          'In-stock',
          keyboardswitches[0],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[0],
          'In-stock',
          keyboardswitches[2],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[2],
          'In-stock',
          keyboardswitches[1],
          false,
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[4],
          'In-stock',
          false,
          keyboardswitches[0],
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[5],
          'Returned',
          false,
          keyboardswitches[2],
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[4],
          'Sold',
          false,
          keyboardswitches[0],
          callback
        );
      },
      function (callback) {
        keyboardInstanceCreate(
          keyboards[0],
          'Sold',
          false,
          keyboardswitches[2],
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

async.series(
  [createSwitchesBrands, createKeyboards, createKeyboardInstances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('KEYBOARDInstances: ' + keyboardinstances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
