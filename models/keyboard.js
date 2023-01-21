const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeyboardSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    minLength: 3,
    required: true,
  },
  description: { type: String, minLength: 3 },
  price: { type: Number, required: true },
  switches: [{ type: Schema.Types.ObjectId, ref: 'KeyboardSwitch' }],
});

KeyboardSchema.virtual('url').get(function () {
  return `/inventory/keyboard/${this._id}`;
});

module.exports = mongoose.model('Keyboard', KeyboardSchema);
