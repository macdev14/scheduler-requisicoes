'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
const { approve } = require("./requisitionInteractorMongoDB");
require('dotenv').config();
require("../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");


exports.requisitionCreatePersistence = async (requisition) => {  
    try {
        const { id, token } = requisition;
        
        if (!id || !token) {
            return { status: 400, message: "token and id are required" }; 
        }

        
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                
                const requisitions = await Requisition.find({
                    active: true,
                    approved: false
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
                        if(typeof product != 'object' || !product.hasOwnProperty('id') || !product.hasOwnProperty('quantity')){
                            return { status: 400, message: "Products must be a JSON object with 'id' and 'quantity' fields" };
                        }
    
                        if(typeof product.id != 'number' || typeof product.quantity != 'number'){
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
                return { status: 201, id: result.id , message: "Requisition created successfully" };
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
