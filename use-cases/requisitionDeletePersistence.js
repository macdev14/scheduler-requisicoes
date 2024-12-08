'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
require("../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");
exports.requisitionDeletePersistence = async ({ id, token }) => {
    //console.log("event", event);

    try {
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
            if (new Date() >= new Date(requisition.start_date)) {
                if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER || decoded.role == process.env.ROLE_EXTERNAL) {
                    await Requisition.updateOne({ id }, { $set: { active: false } });
                    return { status: 200, message: "Requisition deleted" };
                }

            }else{
                if (decoded.role == process.env.ROLE_ADMIN) {
                    await Requisition.updateOne({ id }, { $set: { active: false } });
                    return { status: 200, message: "Requisition deleted" };
                }
            }
            return ({status: 403, message: "Access denied. Insufficient permissions."});
        } catch (err) {
            console.log("err", err);
            return ({status: 403, message: "Access denied"});
        }

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};