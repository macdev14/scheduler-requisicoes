'use strict';
const Requisition = require("../framework/db/mongoDB/models/requisitionModel");

exports.requisitionCreatePersistence = async (data) => {
    try {
        const newRequisition = new Requisition(data);
        await newRequisition.save();
        return { status: 201, message: "Requisition created successfully", requisition: newRequisition };
    } catch (error) {
        console.error("Error creating requisition:", error);
        return { status: 500, message: "Internal server error" };
    }
};
