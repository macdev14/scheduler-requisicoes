'use strict';
const Requisition = require("../framework/db/mongoDB/models/requisitionModel");

exports.requisitionGetAllPersistence = async () => {
    try {
        const requisitions = await Requisition.find();
        return { status: 200, requisitions };
    } catch (error) {
        console.error("Error fetching requisitions:", error);
        return { status: 500, message: "Internal server error" };
    }
};
