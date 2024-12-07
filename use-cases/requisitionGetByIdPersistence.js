'use strict';
const Requisition = require("../framework/db/mongoDB/models/requisitionModel");

exports.requisitionGetByIdPersistence = async ({ id }) => {
    try {
        const requisition = await Requisition.findById(id);
        if (!requisition) {
            return { status: 404, message: "Requisition not found" };
        }
        return { status: 200, requisition };
    } catch (error) {
        console.error("Error fetching requisition by ID:", error);
        return { status: 500, message: "Internal server error" };
    }
};
