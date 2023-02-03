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
  description: { type: String, maxLength: 500 },
  price: { type: Number, min: 1, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
});

KeyboardSchema.virtual('url').get(function () {
  return `/inventory/keyboard/${this._id}`;
});

module.exports = mongoose.model('Keyboard', KeyboardSchema);
