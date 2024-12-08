'use strict';

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
require("../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");
exports.requisitionGetByIdPersistence = async ({id, token, active}) => {
  

    try {
        if (!token) {
            return { status: 400, message: "token required" };
        }



        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER || decoded.role == process.env.ROLE_EXTERNAL) {
                const requisition = await Requisition.findById(id);

                if (!requisition || requisition.length === 0 || !requisition.active) {
                    return { status: 404, message: "Requisition not found" };
                }
                return { status: 200, message: requisition };
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