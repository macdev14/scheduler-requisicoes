'use strict';

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");

// Parses a date string using accepted formats and returns a JavaScript Date object if valid.
// Returns null if the format is invalid.
const parseDate = (dateString) => {
    const formats = ['DD/MM/YYYY', 'YYYY/MM/DD'];
    const date = moment(dateString, formats, true);
    return date.isValid() ? date.toDate() : null;
};


// Returns a catalog of available products.
// If start_date and end_date are provided, only products available in that date range are returned.
// Otherwise, it returns the current available stock for all products.
exports.catalogGet = async (requisition) => {
    const { token, start_date, end_date } = requisition;

    try {
        // Token is mandatory for authentication
        if (!token) {
            return { status: 400, message: "token is required" };
        }

        // Verify user role from the JWT token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (
            decoded.role !== process.env.ROLE_ADMIN &&
            decoded.role !== process.env.ROLE_MANAGER &&
            decoded.role !== process.env.ROLE_USER
        ) {
            return { status: 403, message: "Access denied" };
        }

        // Initialize variables for date filtering
        let parsedStartDate = null;
        let parsedEndDate = null;
        let filterByDate = false;

        // If date range is provided, parse and validate
        if (start_date && end_date) {
            parsedStartDate = parseDate(start_date);
            parsedEndDate = parseDate(end_date);

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

            filterByDate = true;
        }

        // Helper to fetch current stock of a given product
        const getQuantities = async (token, product_id) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}stocks?product_id=${product_id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token,
                    },
                }
            );
            const data = await response.json();
            return data.data?.[0]?.quantity || 0;
        };

        // Helper to fetch all products
        const getProducts = async (token) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}products`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token,
                    },
                }
            );
            const data = await response.json();
            return data.data || [];
        };

        const products = await getProducts(token);
        let product_results = {};

        if (!filterByDate) {
            // No date filtering: return current stock
            for (const product of products) {
                const available = await getQuantities(token, product._id);
                product_results[product._id] = {
                    name: product.name,
                    quantity: available,
                };
            }
        } else {
            // Filter by date: subtract quantities already reserved
            const requisitions = await Requisition.find({
                active: true,
                $and: [
                    { start_date: { $lte: parsedEndDate } },
                    { end_date: { $gte: parsedStartDate } },
                ],
            });

            for (const product of products) {
                const available = await getQuantities(token, product._id);

                // Sum the quantity of the same product in overlapping requisitions
                const reserved = requisitions.reduce((total, req) => {
                    const found = req.required_products.find(p => p.id === product._id);
                    return found ? total + found.quantity : total;
                }, 0);

                const finalQuantity = available - reserved;

                if (finalQuantity > 0) {
                    product_results[product._id] = {
                        name: product.name,
                        quantity: finalQuantity,
                    };
                }
            }
        }

        return {
            status: 200,
            message: "Available products",
            products: product_results,
        };
    } catch (error) {
        console.error("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};

// Returns availability of a specific product by ID.
// If a date range is provided, subtracts any reservations for that period.
exports.catalogGetById = async (requisition) => {
    const { token, id, start_date, end_date } = requisition;

    try {
        // Token and product ID are required
        if (!token || !id) {
            return { status: 400, message: "token and id are required" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id is not a valid id" };
        }

        // Check user permissions
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (
            decoded.role !== process.env.ROLE_ADMIN &&
            decoded.role !== process.env.ROLE_MANAGER &&
            decoded.role !== process.env.ROLE_USER
        ) {
            return { status: 403, message: "Access denied" };
        }

        let parsedStartDate = null;
        let parsedEndDate = null;
        let filterByDate = false;

        if (start_date && end_date) {
            parsedStartDate = parseDate(start_date);
            parsedEndDate = parseDate(end_date);

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

            filterByDate = true;
        }

        // Helper to get current stock of a product
        const getQuantities = async (token, product_id) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}stocks?product_id=${product_id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token,
                    },
                }
            );
            const data = await response.json();
            return data.data?.[0]?.quantity || 0;
        };

        // Helper to fetch product by ID
        const getProductById = async (token, productId) => {
            const response = await fetch(
                `${process.env.URL_INVENTORY}products/${productId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token,
                    },
                }
            );
            const data = await response.json();
            return data.data;
        };

        const product = await getProductById(token, id);
        if (!product) {
            return { status: 404, message: "Product not found" };
        }

        const available = await getQuantities(token, id);
        let finalQuantity = available;

        if (filterByDate) {
            const requisitions = await Requisition.find({
                active: true,
                $and: [
                    { start_date: { $lte: parsedEndDate } },
                    { end_date: { $gte: parsedStartDate } },
                ],
            });

            const reserved = requisitions.reduce((total, req) => {
                const found = req.required_products.find(p => p.id === id);
                return found ? total + found.quantity : total;
            }, 0);

            finalQuantity = available - reserved;
        }

        return {
            status: 200,
            message: "Available product",
            product: {
                id,
                name: product.name,
                quantity: finalQuantity < 0 ? 0 : finalQuantity,
            },
        };
    } catch (error) {
        console.error("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};