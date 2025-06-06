'use strict';

const { RequisitionEntity } = require("../../entities/RequisitionEntity");

exports.createRequisitions = async ({ requisitionsCreate }, requisition) => {
    try {
        const requisitionEntity = new RequisitionEntity(requisition);
        const createRequisition = await requisitionsCreate(requisitionEntity);
        return createRequisition;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getRequisitionsById = async ({ requisitionsGetById }, { id, token }) => {
    try {
        const requisition = await requisitionsGetById({ id, token});
        return requisition;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.updateRequisitions = async ({ requisitionsUpdate }, { id, event_name, start_date, end_date, approved, active, products, token }) => {
    try {
        const updatedData = { id, event_name, start_date, end_date, approved, active, products, token };
        const result = await requisitionsUpdate(updatedData);
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.deleteRequisitions = async ({ requisitionsDelete }, { id, token }) => {
    try {
        const result = await requisitionsDelete({id, token});
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getRequisitions = async ({ requisitionsGetAll }, { id, token }) => {
    try {
        const requisitions = await requisitionsGetAll({ id, token });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.reviewRequisitions = async ({ requisitionsReview }, { token, id, products }) => {
    try {

        const requisitions = await requisitionsReview({ token, id, products });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
