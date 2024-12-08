'use strict';

const { RequisitionEntity } = require("../entities/RequisitionEntity");

exports.create = async ({ requisitionCreatePersistence }, requisition_body) => {
    try {
        const requisition = new RequisitionEntity(requisition_body);
        const createRequisition = await requisitionCreatePersistence(requisition);
        return createRequisition;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getById = async ({ requisitionGetByIdPersistence }, { id }) => {
    try {
        const requisition = await requisitionGetByIdPersistence(id);
        if (!requisition) {
            return { status: 404, message: "Requisition not found" };
        }
        return { status: 200, message: "Requisition retrieved successfully", data: requisition };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.update = async ({ requisitionUpdatePersistence }, { id, title, description, updatedBy }) => {
    try {
        const updatedData = { title, description, updatedBy, updatedAt: new Date() };
        const result = await requisitionUpdatePersistence(id, updatedData);
        if (!result) {
            return { status: 404, message: "Requisition not found" };
        }
        return { status: 200, message: "Requisition updated successfully", data: result };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.delete = async ({ requisitionDeletePersistence }, { id, deletedBy }) => {
    try {
        const result = await requisitionDeletePersistence(id, deletedBy);
        if (!result) {
            return { status: 404, message: "Requisition not found" };
        }
        return { status: 200, message: "Requisition deleted successfully" };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getAll = async ({ requisitionGetAllPersistence }, { createdBy }) => {
    try {
        const requisitions = await requisitionGetAllPersistence(createdBy);
        if (!requisitions || requisitions.length === 0) {
            return { status: 404, message: "No requisitions found" };
        }
        return { status: 200, message: "Requisitions retrieved successfully", data: requisitions };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
