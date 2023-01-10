const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 100 },
  origin: { type: String, minLength: 2, maxLength: 100 },
});

BrandSchema.virtual('url').get(function () {
  return `/inventory/brand/${this._id}`;
});

// Export model
module.exports = mongoose.model('Brand', BrandSchema);
