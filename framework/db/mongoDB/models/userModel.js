'use strict';
const bcrypt = require('bcryptjs');
require('dotenv').config();
//database schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    first_name: { type: String},
    last_name: { type: String},
    password: { type: String, required: true },
    email: { type: String},
    register_date: { type: Date, required: true, default: Date.now }, 
    last_sign_in: { type: Date, required: true, default: Date.now }, 
    document_name: { type: String },
    role: { type: String, ref: 'Role' },
    active: { type: Boolean, required: true, default: true }
},{collection:'users'});

UserSchema.statics.seedAdminUser = async function () {
    try {
        const adminUser = {
            username: 'admin',
            first_name: 'Admin',
            last_name: 'Aluno',
            password: await bcrypt.hash(process.env.SALT + 'admin_password', 10),
            email: 'admin@alunos.ipca.pt',
            register_date: new Date(),
            last_sign_in: new Date(),
            role: 'admin',
            active: true
        };

        // Uppdates the user if it exists
        await this.updateOne(
            { username: adminUser.username }, // Query by username
            { $set: adminUser },              // Update or set data
            { upsert: true }                  // Insert if not exists
        );

    } catch (error) {
        throw error;
    }
};

const User = mongoose.model("User", UserSchema);
module.exports = User;