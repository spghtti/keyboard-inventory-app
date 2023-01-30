const mongoose = require('mongoose');
const { DateTime } = require('luxon');

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
  date_sold: { type: Date },
});

KeyboardInstanceSchema.virtual('url').get(function () {
  return `/inventory/instance/${this._id}`;
});

KeyboardInstanceSchema.virtual('date_sold_formatted').get(function () {
  return DateTime.fromJSDate(this.date_sold).toLocaleString(DateTime.DATE_MED);
});

// Export model
module.exports = mongoose.model('KeyboardInstance', KeyboardInstanceSchema);
