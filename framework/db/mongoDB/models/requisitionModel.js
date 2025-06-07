'use strict';
require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema

const RequiredProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  quantity: { type: Number, required: true }
});

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  district: { type: String, required: true },
  municipality: { type: String, required: true },
  locality: { type: String, required: true },
  postal_code: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});

const RequisitionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  event_name: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  required_products: { type: [RequiredProductSchema], required: true }, // Array of products
  address: { type: AddressSchema, required: true },
  submission_date: { type: Date, default: Date.now },
  reviewed_by: { type: String, default: null },          
  reviewed_at: { type: Date, default: null },
  approved: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
});
// Static method to seed initial requisition
RequisitionSchema.statics.seedInitialRequisition = async function () {
  try {
    const initialRequisition = {

      name: 'Initial Requisition',
      user_id: 'default_user',
      insert_date: new Date(),
      description: 'This is a seeded requisition',
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week later
      // product_id tem que ser um array
      product_id: 'default_product',
      active: true
    };

    // Update or insert the requisition
    await this.updateOne(
      { name: initialRequisition.name }, // Query by name
      { $set: initialRequisition },      // Update or set data
      { upsert: true }                   // Insert if not exists
    );

  } catch (error) {
    throw error;
  }
};

const Requisition = mongoose.model("Requisition", RequisitionSchema);
module.exports = Requisition;
