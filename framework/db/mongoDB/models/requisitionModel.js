'use strict';
require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema
const RequisitionSchema = new Schema({
    name: { type: String, required: true },
    user_id: { type: String, required: true },
    insert_date: { type: Date, required: true, default: Date.now },
    description: { type: String },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    product_id: { type: String, required: true },
    active: { type: Boolean, required: true, default: true }
}, { collection: 'requisitions' });

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
