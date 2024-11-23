'use strict';
//database schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: false, unique: false},
    first_name: {type: String, required: false},
    last_name: {type: String, required: false},
    register_date: {type: String, required: true},
    last_sign_in: {type: String, required: true},
    birthdate: {type: String, required: false},
    document_name: {type: String, required: false},
    active: {type: Boolean, required: true, default: true}
},{collection:'users'});
const User = mongoose.model("User", userSchema);
module.exports = User;