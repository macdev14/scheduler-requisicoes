'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");
// Soft-deletes a requisition by setting its 'active' field to false.
// Only admins, managers, or the original user who created the requisition can delete it.

exports.requisitionsDelete = async ({ id, token }) => {
    try {
        // Check if both token and id are provided
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        // Validate that id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id is not a valid id" };
        }

        try {
            // Verify and decode the token
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            // Check if user is an admin or manager
            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                // Update the requisition, marking it as inactive
                const requisition = await Requisition.updateOne(
                    { _id: id, active: true },
                    { $set: { active: false } }
                );

                // If no requisition was updated, it may not exist or is already inactive
                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }

                return {
                    status: 200,
                    message: "Requisition deleted successfully",
                    data: requisition,
                };
            }

            // If user is a regular user, allow deletion only of their own requisitions
            else if (decoded.role == process.env.ROLE_USER) {
                const requisition = await Requisition.updateOne(
                    { _id: id, user_id: decoded.id, active: true },
                    { $set: { active: false } }
                );

                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }

                return {
                    status: 200,
                    message: "Requisition deleted successfully",
                    data: requisition,
                };
            }

            // If role doesn't match any allowed role
            return {
                status: 403,
                message: "Access denied. Insufficient permissions.",
            };
        } catch (err) {
            // Token verification failed
            console.log("err", err);
            return { status: 403, message: "Access denied" };
        }
    } catch (error) {
        // Catch any unexpected server-side error
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};