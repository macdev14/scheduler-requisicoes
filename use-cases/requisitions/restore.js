'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");
exports.requisitionsRestore = async ({ id, token }) => {

    try {
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id is not a valid id" };
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                const requisition = await Requisition.updateOne({ _id: id, active: false }, { $set: { active: true } });

                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }

                return { status: 200, message: "Requisition deleted successfully", data: requisition };
            } 

            return ({ status: 403, message: "Access denied. Insufficient permissions." });
        } catch (err) {
            console.log("err", err);
            return ({ status: 403, message: "Access denied" });
        }

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};