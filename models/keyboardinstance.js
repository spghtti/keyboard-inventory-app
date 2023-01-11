const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeyboardInstanceSchema = new Schema({
  keyboard: { type: Schema.Types.ObjectId, ref: 'Keyboard', required: true },
  status: {
    type: String,
    required: true,
    enum: ['In-stock', 'Sold', 'Returned'],
    default: 'In-stock',
  },
  keyboard_switch: {
    type: Schema.Types.ObjectId,
    ref: 'KeyboardSwitch',
    required: true,
  },
  date_sold: { type: Date, default: Date.now },
});

KeyboardInstanceSchema.virtual('url').get(function () {
  return `/inventory/instance/${this._id}`;
});

// Export model
module.exports = mongoose.model('KeyboardInstance', KeyboardInstanceSchema);
