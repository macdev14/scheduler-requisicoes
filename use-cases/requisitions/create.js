'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

// Converts a date string into a valid JavaScript Date object.
// Accepts either 'DD/MM/YYYY' or 'YYYY/MM/DD' formats.
// If the input is not valid, returns null.
const parseDate = (dateString) => {
    const formats = ['DD/MM/YYYY', 'YYYY/MM/DD'];
    const date = moment(dateString, formats, true);
    return date.isValid() ? date.toDate() : null;
};

const Requisition = mongoose.model("Requisition");

// Creates a new requisition, performing validation on input fields,
// checking availability of products for the given date range, 
// and ensuring the user has a valid token and permissions.

exports.requisitionsCreate = async (requisition) => {
    try {
        const {
            event_name,
            start_date,
            end_date,
            required_products,
            address,
            token,
        } = requisition;

        // Basic field validation (required fields)
        if (!event_name || !start_date || !end_date || !token ||
            !address.street || !address.district || !address.municipality ||
            !address.locality || !address.postal_code ||
            !address.latitude || !address.longitude) {
            return {
                status: 400,
                message: "token, event_name, start_date, end_date, address, street, district, municipality, locality, postal_code, latitude and longitude are required",
            };
        }

        // Validate required_products is a non-empty array
        if (!required_products || !Array.isArray(required_products) || required_products.length === 0) {
            return {
                status: 400,
                message: "required_products must be a non-empty array",
            };
        }

        // Validate that each product has a valid Mongo ID and a numeric quantity > 0
        const areProductsValid = required_products.every((product) => {
            const isIdValid = typeof product.id === "string" && mongoose.Types.ObjectId.isValid(product.id);
            const isQuantityValid = !isNaN(product.quantity) && Number(product.quantity) > 0;
            return isIdValid && isQuantityValid;
        });

        if (!areProductsValid) {
            return {
                status: 400,
                message: "required_products must be an array of objects with valid Mongo IDs and numeric quantities",
            };
        }

        // Enforce event name length limit
        if (event_name.length > process.env.EVENT_NAME_MAX_SIZE) {
            return {
                status: 400,
                message: `event name must be less than ${process.env.EVENT_NAME_MAX_SIZE} characters`,
            };
        }

        // Parse and validate dates
        const parsedStartDate = parseDate(start_date);
        const parsedEndDate = parseDate(end_date);
        if (!parsedStartDate || !parsedEndDate) {
            return {
                status: 400,
                message: "Invalid date format. Use dd/mm/yyyy or yyyy/mm/dd",
            };
        }

        // Dates must not be in the past
        if (parsedStartDate < new Date() || parsedEndDate < new Date()) {
            return {
                status: 400,
                message: "start_date and end_date cannot be set before today's date",
            };
        }

        // End date must not precede start date
        if (parsedEndDate < parsedStartDate) {
            return {
                status: 400,
                message: "end_date cannot be set to a date before start_date",
            };
        }

        // Validate latitude and longitude values
        if (isNaN(address.latitude) || address.latitude < -90 || address.latitude > 90) {
            return { status: 400, message: "latitude must be a number between -90 and 90" };
        }

        if (isNaN(address.longitude) || address.longitude < -180 || address.longitude > 180) {
            return { status: 400, message: "longitude must be a number between -180 and 180" };
        }

        // Verify and decode token to retrieve user role
        let decoded = '';
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);

            // Only specific roles are allowed to create a requisition
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

        // Get all overlapping active requisitions for the selected date range
        const existingRequisitions = await Requisition.find({
            active: true,
            $and: [
                { start_date: { $lte: parsedEndDate } },
                { end_date: { $gte: parsedStartDate } },
            ],
        });

        // Fetch the current stock of a product
        const getQuantities = async (token, product_id) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}stocks?product_id=${product_id}`,
                { headers: { 'Content-Type': 'application/json', token } }
            );
            const data = await response.json();
            return data.data?.[0]?.quantity || 0;
        };

        // Verify that all requested products have enough available stock
        const checkAvailability = async () => {
            const availability = {};

            for (const { id, quantity } of required_products) {
                const available = await getQuantities(token, id);

                // Calculate how much is already reserved in overlapping requisitions
                const reserved = existingRequisitions.reduce((total, req) => {
                    const product = req.required_products.find(p => p.id === id);
                    return product ? total + product.quantity : total;
                }, 0);

                // If not enough stock is available, reject the requisition
                if (available - reserved < quantity) {
                    return { status: 400, message: `Product ${id} does not have enough stock.` };
                }
            }
        };

        // Run availability check
        const check = await checkAvailability();
        if (check) return check;

        // Create the new requisition object
        const newRequisition = {
            user_id: decoded.id,
            event_name,
            start_date: parsedStartDate,
            end_date: parsedEndDate,
            approved: false,
            active: true,
            required_products,
            address: requisition.address,
        };

        // Insert requisition into the database
        const result = await Requisition.create(newRequisition);
        return { status: 201, id: result.id, message: "Requisition created successfully" };
    } catch (error) {
        console.error("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};
