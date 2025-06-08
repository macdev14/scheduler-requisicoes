'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();


require("../../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");

// Parses a date string into a Date object using accepted formats.
// Returns a valid Date object or null if parsing fails.
const parseDate = (dateString) => {
    const formats = ['DD/MM/YYYY', 'YYYY/MM/DD'];
    const date = moment(dateString, formats, true);
    return date.isValid() ? date.toDate() : null;
};

// Updates an existing requisition with new event info, dates, required products and address.
// It verifies permissions, product stock availability in the new date range,
// and ensures all input data is properly validated.
exports.requisitionsUpdate = async (requisition) => {
    try {
        const {
            id,
            event_name,
            start_date,
            end_date,
            required_products,
            address,
            token,
            approved,
            active
        } = requisition;

        // Basic validation for required fields
        if (!id || !event_name || !start_date || !end_date || !token || !required_products || required_products.length === 0) {
            return { status: 400, message: "token, event_name, required_products, start_date, and end_date are required" };
        }

        // Ensure ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id must be a valid id" };
        }

        // Check each required product for valid ID and positive quantity
        const areProductsValid = required_products.every((product) => {
            const isIdValid = typeof product.id === "string" && mongoose.Types.ObjectId.isValid(product.id);
            const isQuantityValid = !isNaN(product.quantity) && Number(product.quantity) > 0;
            return isIdValid && isQuantityValid;
        });

        if (!areProductsValid) {
            return {
                status: 400,
                message: "required_products must be an array of objects with valid ids and numeric quantities",
            };
        }

        // Validate event name size
        if (event_name.length > process.env.EVENT_NAME_MAX_SIZE) {
            return { status: 400, message: `event name must be less than ${process.env.EVENT_NAME_MAX_SIZE} characters` };
        }

        // Parse and validate dates
        const parsedStartDate = parseDate(start_date);
        const parsedEndDate = parseDate(end_date);

        if (!parsedStartDate || !parsedEndDate) {
            return { status: 400, message: "Invalid date format. Use dd/mm/yyyy or yyyy/mm/dd" };
        }

        if (parsedStartDate < new Date() || parsedEndDate < new Date()) {
            return { status: 400, message: "start_date and end_date cannot be set before today's date" };
        }

        if (parsedEndDate < parsedStartDate) {
            return { status: 400, message: "end_date cannot be set to a date before start_date" };
        }

        // Validate address fields
        if (!address || !address.street || !address.district || !address.municipality || !address.locality || !address.postal_code) {
            return { status: 400, message: "Incomplete address information" };
        }

        if (isNaN(address.latitude) || address.latitude < -90 || address.latitude > 90) {
            return { status: 400, message: "latitude must be a number between -90 and 90" };
        }

        if (isNaN(address.longitude) || address.longitude < -180 || address.longitude > 180) {
            return { status: 400, message: "longitude must be a number between -180 and 180" };
        }

        // Decode token and check permissions
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (
                decoded.role !== process.env.ROLE_ADMIN &&
                decoded.role !== process.env.ROLE_MANAGER &&
                decoded.role !== process.env.ROLE_USER
            ) {
                return { status: 403, message: "Access denied" };
            }
        } catch (err) {
            console.log("err", err);
            return { status: 403, message: "Access denied" };
        }

        // Find other overlapping requisitions (excluding current one)
        const existingRequisitions = await Requisition.find({
            active: true,
            _id: { $ne: id }, // ignore the current requisition
            $and: [
                { start_date: { $lte: parsedEndDate } },
                { end_date: { $gte: parsedStartDate } },
            ],
        });

        // Helper to get stock for a given product
        const getQuantities = async (token, product_id) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}stocks?product_id=${product_id}`,
                { headers: { 'Content-Type': 'application/json', token } }
            );
            const data = await response.json();
            return data.data?.[0]?.quantity || 0;
        };

        // Ensure each product has enough stock for the updated dates
        for (const { id: prodId, quantity } of required_products) {
            const available = await getQuantities(token, prodId);
            const reserved = existingRequisitions.reduce((total, req) => {
                const product = req.required_products.find(p => p.id === prodId);
                return product ? total + product.quantity : total;
            }, 0);

            if (available - reserved < quantity) {
                return { status: 400, message: `Product ${prodId} does not have enough stock.` };
            }
        }

        // Build updated requisition object
        const updateRequisition = {
            user_id: decoded.id,
            event_name,
            start_date: parsedStartDate,
            end_date: parsedEndDate,
            required_products,
            address,
            approved: approved !== undefined ? approved : false,
            active: active !== undefined ? active : true,
        };

        // Perform update
        const result = await Requisition.findByIdAndUpdate(id, updateRequisition, { new: true });

        return { status: 200, message: "Requisition updated successfully", data: result };

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};
