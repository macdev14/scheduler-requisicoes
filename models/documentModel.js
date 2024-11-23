'use strict';
//database schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const documentSchema = new Schema({                     //Document will represent the profile picture
    hidden_name: {type: String, required: true},
    real_name: {type: String, required: true},
    insert_date: {type: String, required: true},
    extension: {type: String, required: true},
    active: {type: String, required: true}
},{collection:'documents'});
const Document = mongoose.model("Document", documentSchema);

module.exports = Document;