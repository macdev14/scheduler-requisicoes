'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");


exports.requisitionsReview = async (requisition) => {  
    try {
        const { id, token, products } = requisition;
        const requisition_db = await Requisition.findById({_id: id, active: true});
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

                const createEvent = async ({id, token, name,start_date, end_date, description='', comments=''}) => {
                    try {
                        const response = await fetch(process.env.URL_EVENTS + '/api/event/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'token': token
                            }, 
                            body: JSON.stringify({
                                name: name,
                                start_date: start_date,
                                end_date: end_date,
                                requisition_id: id,
                                description: description,
                                comments: comments
                            })
                        });
                
                        if (!response.ok) {
                            console.error('Error:', response);
                            return { status: response.status, message: response.message };
                        }
                        
                        const data = await response.json();
                       
                       
                        return { status: 200, message: "Event created", message: data };
                       
                    } catch (error) {
                        console.error('Error:', error);
                        return { status: 404, message: "Event could not be created" };
                    }
                };


                const db_products = await getProducts(token);
              
                let product_results = {}

                for (const product of db_products.products.data) {
                    const quantities = await getQuantities(token, product.id);
                   
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
                // let qntDoPro = requisition.quantiy


                // requisitions.forEach(requisition => { 
                //         requisition.products.forEach(product_db => {
                //             products.forEach(product => {

                //                 if(product_db.id == product.id){
                //                     has = true 
                //                     //&& !product_db.quantity < product.quantity
                //                     qntDoPro -= product.quantity
                //                 };
                                
                //             });

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


                // const createRequisition = {
                //     user_id: decoded.id,
                //     event_name: event_name,
                //     start_date: parsedStartDate,
                //     end_date: parsedEndDate,
                //     approved: false,
                //     active: true,
                //     products
                // };
               
              
          
                let obj = { id: requisition_db.id, 
                    token: token, name:requisition_db.event_name,
                     start_date: moment(requisition_db.start_date).format('DD/MM/YYYY'), 
                     end_date: moment(requisition_db.end_date).format('DD/MM/YYYY')
                }
                const res = await Requisition.findByIdAndUpdate(id, {approved: true}, {new: true});
                const res_event = await createEvent(obj);
                return res_event
            }
            return ({status: 403, message: "Access denied. Insufficient permissions."});
        } catch (err) {
            console.log("err", err);
            return err;
        }
    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};
