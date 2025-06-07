'use strict';

const { RequisitionJwtEntity } = require("../../entities/RequisitionJwtEntity");

exports.createRequisitions = async ({ requisitionsCreate }, requisition) => {
    try {
        const requisitionEntity = new RequisitionJwtEntity(requisition);
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

exports.updateRequisitions = async ({ requisitionsUpdate }, { id, event_name, start_date, end_date, required_products, address, token }) => {
    try {
        const updatedData = { id, event_name, start_date, end_date, required_products, address, token };
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

exports.restoreRequisitions = async ({ requisitionsRestore }, { id, token }) => {
    try {
        const result = await requisitionsRestore({id, token});
        return result;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getRequisitions = async ({ requisitionsGet }, {token, page, limit, search, approved, user_id, start_date, end_date, active}) => {
    try {
        const requisitions = await requisitionsGet({token, page, limit, search, approved, user_id, start_date, end_date, active});
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.reviewRequisitions = async ({ requisitionsReview }, { token, id, review }) => {
    try {

        const requisitions = await requisitionsReview({ token, id, review });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};
