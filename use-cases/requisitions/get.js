'use strict';

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");


exports.requisitionsGet = async ({ token, page = 1, limit = 10, search, approved, user_id, start_date, end_date, active = true }) => {
    try {
        console.log({ token, page, limit, search, approved, user_id, start_date, end_date, active });

        if (!token) {
            return { status: 400, message: "token required" };
        }

        let decoded = '';
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (
                decoded.role !== process.env.ROLE_ADMIN &&
                decoded.role !== process.env.ROLE_MANAGER &&
                decoded.role !== process.env.ROLE_USER
            ) {
                return { status: 403, message: "Access denied" };
            }
        } catch (error) {
            return { status: 403, message: "Access denied" };
        }

        const query = {};

        if (search) {
            query.event_name = { $regex: search, $options: 'i' };
        }

        if (approved !== undefined) {
            query.approved = approved === 'true' || approved === true;
        }

        if (user_id) {
            query.user_id = user_id;
        } else if (decoded.role === process.env.ROLE_USER) {
            query.user_id = decoded.id;
        }

        if (start_date && end_date) {
            query.start_date = { $gte: new Date(start_date) };
            query.end_date = { $lte: new Date(end_date) };
        }

        if (active) {
            query.active = active
        }

        const skip = (page - 1) * limit;

        const [requisitions, total] = await Promise.all([
            Requisition.find(query).skip(skip).limit(limit),
            Requisition.countDocuments(query),
        ]);

        if (!requisitions || requisitions.length === 0) {
            return { status: 404, message: "Requisitions not found" };
        }

        return {
            status: 200,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: requisitions
        };
    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};

exports.requisitionsGetById = async ({ id, token }) => {


    try {
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id is not a valid id" };
        }
        
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                const requisition = await Requisition.findById({ _id: id, active: true });

                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }
                return { status: 200, message: requisition };
            } else if (decoded.role == process.env.ROLE_USER) {
                const requisition = await Requisition.findById({ _id: id, active: true, user_id: decoded.id });

                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }
                return { status: 200, message: requisition };
            }
            return ({ status: 403, message: "Access denied. Insufficient permissions." });
        } catch (err) {
            console.log("err", err);
            return ({ status: 403, message: "Access denied" });
        }

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};