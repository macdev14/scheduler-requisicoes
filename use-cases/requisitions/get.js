'use strict';

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");

 
exports.requisitionsGet = async (requisition) => {
    
    const {token} = requisition;

    try {
        if (!token) {
            return { status: 400, message: "token required" };
        }



        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER || decoded.role == process.env.ROLE_USER) {
                const events = await Requisition.find({ active: true });

                if (!events || events.length === 0) {
                    return { status: 404, message: "Requisitions not found" };
                }
                return { status: 200, message: events };
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

exports.requisitionGetByIdPersistence = async ({id, token}) => {
  

    try {
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER || decoded.role == process.env.ROLE_USER) {
                const requisition = await Requisition.findById({_id: id, active: true});

                if (!requisition) {
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