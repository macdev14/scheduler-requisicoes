'use strict';

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");

const parseDate = (dateString) => {
    const formats = ['DD/MM/YYYY', 'YYYY/MM/DD'];
    const date = moment(dateString, formats, true);
    return date.isValid() ? date.toDate() : null;
};

 
exports.requisitionGetCatalog = async (requisition) => {
    
    const {token, start_date, end_date} = requisition;

    try {
        if (!token || !start_date || !end_date) {
            return { status: 400, message: "token, start_date, and end_date are required" };
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
                    const response = await fetch(process.env.URL_INVENTORY + '/api/stock?product_id=' + product_id, {
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
                const firstStock = Array.isArray(quantities.stocks.data) && quantities.stocks.data.length > 0 ? quantities.stocks.data[0].quantity :  0;
            
                product_results[product.id] = {
                    name: product.name,
                    quantity: firstStock
                };
            }

            if(!requisitions || requisitions.length == 0){
         
                return ({status: 200, message: "Available products", products: product_results});
            }

            return ({status: 403, message: "Access denied. Insufficient permissions."});
        }
        return ({status: 403, message: "Access denied"});
    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};