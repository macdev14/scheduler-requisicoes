'use strict';
const Requisition = require("../framework/db/mongoDB/models/requisitionModel");

exports.requisitionDeletePersistence = async ({ id }) => {
    try {
        const deletedRequisition = await Requisition.findByIdAndDelete(id);
        if (!deletedRequisition) {
            return { status: 404, message: "Requisition not found" };
        }
        return { status: 200, message: "Requisition deleted successfully" };
    } catch (error) {
        console.error("Error deleting requisition:", error);
        return { status: 500, message: "Internal server error" };
    }
};
