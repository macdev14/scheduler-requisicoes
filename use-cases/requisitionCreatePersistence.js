'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("../framework/db/mongoDB/models/requisitionModel");

const Requisition = mongoose.model("Requisition");
exports.requisitionCreatePersistence = async (event) => {
    //console.log("event", event);
    const { event_name, start_date, end_date, approved, active, products } = event;

    try {
        if (!event_name || !start_date || !end_date || !token || products.length == 0) {
            return { status: 400, message: "token, name, start_date, and end_date are required" };
        }

        if (name.length > process.env.EVENT_NAME_MAX_SIZE) {
            return { status: 400, message: `event name must be less than ${process.env.EVENT_NAME_MAX_SIZE} characters` };
        }

        const parsedStartDate = parseDate(start_date);
        const parsedEndDate = parseDate(end_date);

        if (!parsedStartDate || !parsedEndDate) {
            return { status: 400, message: "Invalid date format. Use dd/mm/yyyy or yyyy/mm/dd" };
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                const createEvent = {
                    event_name,
                    start_date: parsedStartDate,
                    end_date: parsedEndDate,
                    approved,
                    active,
                    products
                };
                await Requisition.create(createEvent);
                console.log("createRequisition", createEvent);
                return { status: 201, message: "Requisition created successfully" };
            }
            return ({status: 403, message: "Access denied. Insufficient permissions."});
        } catch (err) {
            console.log("err", err);
            return ({status: 403, message: "Access denied"});
        }

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};
