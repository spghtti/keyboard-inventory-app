const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeyboardSwitchSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  display_name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, maxLength: 500 },
});

KeyboardSwitchSchema.virtual('url').get(function () {
  return `/inventory/switch/${this._id}`;
});

KeyboardSwitchSchema.virtual('lowercase-name').get(function () {
  return this.name.toLowerCase();
});

// Export model
module.exports = mongoose.model('KeyboardSwitch', KeyboardSwitchSchema);
