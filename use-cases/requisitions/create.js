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
        const { event_name, start_date, end_date, required_products, token } = requisition;

        if (!event_name || !start_date || !end_date || !token) {
            return { status: 400, message: "token, event_name, start_date, and end_date are required" };
        }

        console.log(required_products);
        if (!required_products || required_products.length == 0) {
            return { status: 400, message: "required_products must be an array and must not be empty" };
        }

        const isValid = required_products.every(product => {
            const isIdValid = typeof product.id === "string" && mongoose.Types.ObjectId.isValid(product.id);
            const isQuantityValid = !isNaN(product.quantity) && Number(product.quantity) > 0;

            return isIdValid && isQuantityValid;
        });

        if (!isValid) {
            return {
                status: 400,
                message: "required_products must be an array of objects with valid Mongo IDs and numeric quantities",
            };
        }

        if (event_name.length > process.env.EVENT_NAME_MAX_SIZE) {
            return { status: 400, message: `event name must be less than ${process.env.EVENT_NAME_MAX_SIZE} characters` };
        }

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

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER || decoded.role == process.env.ROLE_USER) {

                const requisitions = await Requisition.find({
                    active: true,
                    $and: [
                        {
                            start_date: { $gte: parsedStartDate, $lte: parsedEndDate }
                        },
                        {
                            end_date: { $gte: parsedStartDate, $lte: parsedEndDate }
                        }
                    ]
                });
                const getQuantities = async (token, product_id) => {
                    try {
                        const response = await fetch(process.env.URL_INVENTORY + 'stocks?product_id=' + product_id, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'token': token
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Failed to fetch products in stock');
                        }

                        const data = await response.json();

                        return { status: 200, message: "Available products", stocks: data };
                    } catch (error) {
                        console.error('Error:', error);
                        return { status: 404, message: "Requisitions not found" };
                    }
                };
                const getProducts = async (token) => {
                    try {
                        const response = await fetch(process.env.URL_INVENTORY + '/api/product/all', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'token': token
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Failed to fetch products');
                        }

                        const data = await response.json();
                        return { status: 200, message: "Available products", products: data };
                    } catch (error) {
                        console.error('Error:', error);
                        return { status: 404, message: "Requisitions not found" };
                    }
                };

                const db_products = await getProducts(token);

                let product_results = {}

                for (const product of db_products.products.data) {
                    const quantities = await getQuantities(token, product.id);
                    console.log(quantities.stocks.data);
                    const firstStock = Array.isArray(quantities.stocks.data) && quantities.stocks.data.length > 0 ? quantities.stocks.data[0].quantity : 0;

                    product_results[product.id] = {
                        name: product.name,
                        quantity: firstStock
                    };
                }

                if (!requisitions || requisitions.length == 0) {

                    // return ({status: 200, message: "Available products", products: product_results});
                }

                // requisitions.forEach(requisition => {
                //     console.log();
                // })
                // qntDoPro
                //fazer um loop pelas reqs
                //qntDoPro -= requisition.quantiy


                // requisitions.forEach(requisition => { 
                //         requisition.products.forEach(product_db => {
                //             products.forEach(product => {

                //                 if(product_db.id == product.id && !product_db.quantity < product.quantity){
                //                     has = true
                //                 }
                //             })
                //         })
                // })
                try {
                    products.forEach(product => {
                        if (typeof product != 'object' || !product.hasOwnProperty('id') || !product.hasOwnProperty('quantity')) {
                            return { status: 400, message: "Products must be a JSON object with 'id' and 'quantity' fields" };
                        }

                        if (typeof product.id != 'number' || typeof product.quantity != 'number') {
                            return { status: 400, message: "Product 'id' and 'quantity' must be numbers" };
                        }
                    });
                } catch (error) {
                    return { status: 400, message: "Invalid product format, must be a JSON object with 'id' and 'quantity' fields" };
                }


                const createRequisition = {
                    user_id: decoded.id,
                    event_name,
                    start_date: parsedStartDate,
                    end_date: parsedEndDate,
                    approved: false,
                    active: true,
                    products
                };

                const result = await Requisition.create(createRequisition);
                console.log();
                return { status: 201, id: result.id, message: "Requisition created successfully" };
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
