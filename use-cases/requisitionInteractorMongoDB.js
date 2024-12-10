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
        const requisition = await requisitionGetByIdPersistence({ id, token});
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
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.delete = async ({ requisitionDeletePersistence }, { id, token }) => {
    try {
        const result = await requisitionDeletePersistence({id, token});
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getAll = async ({ requisitionGetAllPersistence }, { id, token }) => {
    try {
        const requisitions = await requisitionGetAllPersistence({ id, token });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getAll = async ({ requisitionGetAllPersistence }, { id, token }) => {
    try {
        const requisitions = await requisitionGetAllPersistence({ id, token });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
exports.getCatalog = async ({ requisitionGetCatalog }, { token, start_date, end_date }) => {
    try {

        const requisitions = await requisitionGetCatalog({ token, start_date, end_date });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
exports.approve = async ({ requisitionApprove }, { token, id, products }) => {
    try {

        const requisitions = await requisitionApprove({ token, id, products });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
