'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");

const parseDate = (dateString) => {
    const formats = ['DD/MM/YYYY', 'YYYY/MM/DD'];
    const date = moment(dateString, formats, true);
    return date.isValid() ? date.toDate() : null;
};

const Requisition = mongoose.model("Requisition");

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

        // Basic field validation
        if (!event_name || !start_date || !end_date || !token || !address.street || !address.city || !address.postal_code || !address.country || !address.latitude || !address.longitude) {
            return {
                status: 400,
                message: "token, event_name, start_date, end_date, address, city, postal_code, country, latitude and longitude are required",
            };
        }

        if (!required_products || !Array.isArray(required_products) || required_products.length === 0) {
            return {
                status: 400,
                message: "required_products must be a non-empty array",
            };
        }

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

        if (event_name.length > process.env.EVENT_NAME_MAX_SIZE) {
            return {
                status: 400,
                message: `event name must be less than ${process.env.EVENT_NAME_MAX_SIZE} characters`,
            };
        }

        const parsedStartDate = parseDate(start_date);
        const parsedEndDate = parseDate(end_date);
        if (!parsedStartDate || !parsedEndDate) {
            return {
                status: 400,
                message: "Invalid date format. Use dd/mm/yyyy or yyyy/mm/dd",
            };
        }

        if (parsedStartDate < new Date() || parsedEndDate < new Date()) {
            return {
                status: 400,
                message: "start_date and end_date cannot be set before today's date",
            };
        }

        if (parsedEndDate < parsedStartDate) {
            return {
                status: 400,
                message: "end_date cannot be set to a date before start_date",
            };
        }


        if (isNaN(address.latitude) || address.latitude < -90 || address.latitude > 90) {
            return { status: 400, message: "latitude must be a number between -90 and 90" };
        }

        if (isNaN(address.longitude) || address.longitude < -180 || address.longitude > 180) {
            return { status: 400, message: "longitude must be a number between -180 and 180" };
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



        const existingRequisitions = await Requisition.find({
            active: true,
            $and: [
                { start_date: { $lte: parsedEndDate } },
                { end_date: { $gte: parsedStartDate } },
            ],
        });

        const getQuantities = async (token, product_id) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}stocks?product_id=${product_id}`,
                { headers: { 'Content-Type': 'application/json', token } }
            );
            const data = await response.json();
            return data.data?.[0]?.quantity || 0;
        };

        const checkAvailability = async () => {
            const availability = {};

            for (const { id, quantity } of required_products) {
                const available = await getQuantities(token, id);

                const reserved = existingRequisitions.reduce((total, req) => {
                    const product = req.required_products.find(p => p.id === id);
                    return product ? total + product.quantity : total;
                }, 0);

                if (available - reserved < quantity) {
                    return { status: 400, message: `Product ${id} does not have enough stock.` };
                }
            }
        };

        const check = await checkAvailability();
        if (check) return check;

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

        const result = await Requisition.create(newRequisition);
        return { status: 201, id: result.id, message: "Requisition created successfully" };
    } catch (error) {
        console.error("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};
