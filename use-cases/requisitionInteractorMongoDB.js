'use strict';

const { RequisitionEntity } = require("../entities/RequisitionEntity");

/**
 * Creates a new Requisition and persists it in the database.
 * @param {Object} dependencies - Persistence dependencies
 * @param {Object} requisition_body - Requisition data to be saved
 * @returns {Promise<Object>} Response object
 */
exports.create = async ({ requisitionCreatePersistence }, requisition) => {
    try {
        const requisitionEntity = new RequisitionEntity(requisition);
        const createRequisition = await requisitionCreatePersistence(requisitionEntity);
        return createRequisition;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getById = async ({ requisitionGetByIdPersistence }, { id, token }) => {
    try {
        const active = true;
        const requisition = await requisitionGetByIdPersistence({ id, token, active });
        if (!requisition) {
            return { status: 404, message: "Requisition not found" };
        }
        return requisition;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.update = async ({ requisitionUpdatePersistence }, { id, event_name, start_date, end_date, approved, active, products, token }) => {
    try {
        const updatedData = { id, event_name, start_date, end_date, approved, active, products, token };
        const result = await requisitionUpdatePersistence(updatedData);
        if (!result) {
            return { status: 404, message: "Requisition not found" };
        }
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.delete = async ({ requisitionDeletePersistence }, { id, token }) => {
    try {
        const result = await requisitionDeletePersistence({id, token});
        if (!result) {
            return { status: 404, message: "Requisition not found" };
        }
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getAll = async ({ requisitionGetAllPersistence }, { id, token }) => {
    try {
        const active = true;
        const requisitions = await requisitionGetAllPersistence({ active, id, token });
        if (!requisitions || requisitions.length === 0) {
            return { status: 404, message: "No requisitions found" };
        }
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
