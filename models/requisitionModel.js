'use strict';
//database schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RequisitionSchema = new Schema({
    name: { type: String, required: true },
    user_id: { type: String, required: true },
    insert_date: { type: String, required: true },
    description: { type: String, required: false },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    product_id: { type: String, required: true },
    active: { type: String, required: true }
}, { collection: 'requisitions' });
const Requisition = mongoose.model("Requisition", RequisitionSchema);

module.exports = Requisition;