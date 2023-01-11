const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeyboardSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 100 },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  description: { type: String, minLength: 2 },
  price: { type: Number, required: true, min: 1 },
});

KeyboardSchema.virtual('url').get(function () {
  return `/inventory/keyboard/${this._id}`;
});

module.exports = mongoose.model('Keyboard', KeyboardSchema);
