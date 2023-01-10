const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SwitchSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, minLength: 3, maxLength: 100 },
});

SwitchSchema.virtual('url').get(function () {
  return `/inventory/switch/${this._id}`;
});

// Export model
module.exports = mongoose.model('Switch', SwitchSchema);
