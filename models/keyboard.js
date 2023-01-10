const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeyboardSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 100 },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  summary: { type: String, minLength: 2 },
  switch: { type: Schema.Types.ObjectId, ref: 'Switch', required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
});

KeyboardSchema.virtual('url').get(function () {
  return `/inventory/keyboard/${this._id}`;
});

module.exports = mongoose.model('Keyboard', KeyboardSchema);
