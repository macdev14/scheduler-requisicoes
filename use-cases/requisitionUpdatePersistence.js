'use strict';
const Requisition = require("../framework/db/mongoDB/models/requisitionModel");

exports.requisitionUpdatePersistence = async (data) => {
    const { id, ...updateFields } = data;
    try {
        const updatedRequisition = await Requisition.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updatedRequisition) {
            return { status: 404, message: "Requisition not found" };
        }
        return { status: 200, message: "Requisition updated successfully", requisition: updatedRequisition };
    } catch (error) {
        console.error("Error updating requisition:", error);
        return { status: 500, message: "Internal server error" };
    }
};
