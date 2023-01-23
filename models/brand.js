const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  display_name: { type: String, required: true, minLength: 3, maxLength: 100 },
  origin: { type: String, maxLength: 100 },
});

BrandSchema.virtual('url').get(function () {
  return `/inventory/brand/${this._id}`;
});

BrandSchema.virtual('lowercase-name').get(function () {
  return this.name.toLowerCase();
});

// Export model
module.exports = mongoose.model('Brand', BrandSchema);
