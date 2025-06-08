'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");
// Restores a previously deactivated requisition by setting its 'active' field to true.
// Only Admins and Managers are allowed to perform this operation.

exports.requisitionsRestore = async ({ id, token }) => {
    try {
        // Validate required fields
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        // Ensure the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id is not a valid id" };
        }

        try {
            // Decode and verify the token
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            // Allow only ADMIN and MANAGER roles to restore a requisition
            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                // Restore the requisition (set active back to true)
                const requisition = await Requisition.updateOne(
                    { _id: id, active: false },
                    { $set: { active: true } }
                );

                // If the requisition was not found or already active
                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }

                return { status: 200, message: "Requisition restored successfully", data: requisition };
            } 

            // All other roles are denied access
            return { status: 403, message: "Access denied. Insufficient permissions." };
        } catch (err) {
            console.log("err", err);
            return { status: 403, message: "Access denied" };
        }

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};