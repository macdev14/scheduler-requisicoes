'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();


require("../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");
const parseDate = (dateString) => {
    const formats = ['DD/MM/YYYY', 'YYYY/MM/DD'];
    const date = moment(dateString, formats, true);
    return date.isValid() ? date.toDate() : null;
};

exports.requisitionUpdatePersistence = async (requisition) => {
    //console.log("event", event);
   

    try {
        const { id, event_name, start_date, end_date, approved, active, products, token } = requisition;
        console.log("token", token);
        console.log("requisition", requisition);
        if (!id || !event_name || !start_date || !end_date || !token || products.length == 0) {
            return { status: 400, message: "token, event name, products, start_date, and end_date are required" };
        }

        if (event_name.length > process.env.EVENT_NAME_MAX_SIZE) {
            return { status: 400, message: `event name must be less than ${process.env.EVENT_NAME_MAX_SIZE} characters` };
        }

        const parsedStartDate = parseDate(start_date);
        const parsedEndDate = parseDate(end_date);

        if (!parsedStartDate || !parsedEndDate) {
            return { status: 400, message: "Invalid date format. Use dd/mm/yyyy or yyyy/mm/dd" };
        }
 
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER || decoded.role == process.env.ROLE_EXTERNAL) {
                const updateRequisition = {
                    user_id: decoded.id,
                    event_name,
                    start_date: parsedStartDate,
                    end_date: parsedEndDate,
                    approved,
                    active,
                    products
                };
                if (parsedEndDate) updateRequisition.event_name = event_name;
                if (start_date) updateRequisition.start_date = parsedStartDate;
                if (end_date) updateRequisition.end_date = parsedEndDate;
                if (approved) updateRequisition.approved = approved;
                if (active) updateRequisition.active = active;
                if (products) updateRequisition.products = products;
                console.log("updateRequisition", updateRequisition);
                console.log("id", id);
                // await Event.findByIdAndUpdate(id, updateEvent, { new: true });
                
                const result = await Requisition.findByIdAndUpdate(id, updateRequisition, { new: true });
                console.log("Updated Requisition ", result);
                return  result;
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
