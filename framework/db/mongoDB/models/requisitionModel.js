'use strict';
require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const RequisitionSchema = new mongoose.Schema({
  event_name: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  products: { type: [ProductSchema], required: true }, // Array of products
  approved: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
});
// Static method to seed initial requisition
// RequisitionSchema.statics.seedInitialRequisition = async function () {
//     try {
//         const initialRequisition = {
        
//             name: 'Initial Requisition',
//             user_id: 'default_user',
//             insert_date: new Date(),
//             description: 'This is a seeded requisition',
//             start_date: new Date(),
//             end_date: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week later
//             // product_id tem que ser um array
//             product_id: 'default_product',
//             active: true
//         };

//         // Update or insert the requisition
//         await this.updateOne(
//             { name: initialRequisition.name }, // Query by name
//             { $set: initialRequisition },      // Update or set data
//             { upsert: true }                   // Insert if not exists
//         );

//     } catch (error) {
//         throw error;
//     }
// };

const Requisition = mongoose.model("Requisition", RequisitionSchema);
module.exports = Requisition;
