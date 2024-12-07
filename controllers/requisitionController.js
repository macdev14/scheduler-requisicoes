const Document = require('../models/requisitionModel');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

exports.register = async (req, res) => {
    console.log(req.body);
    const { token } = req.headers;
    const { name, insert_date, start_date, end_date, product_id } = req.body;

    if (!token) {
        return res.status(400).send("Token is required");
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        return res.status(401).send("Invalid or expired token");
    }
    const username = decoded.username;

    if (!name || !insert_date || !start_date || !end_date || !product_id) {
        return res.status(400).send("name, insert_date, start_date, end_date, and product_id are required");
    }

    const dateRegex = /^(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12][0-9]|3[01])$/;

    // Validate start_date
    if (!dateRegex.test(start_date)) {
        return res.status(400).send("Invalid start_date format, should be yyyy-mm-dd or yyyy/mm/dd");
    }
    const [startYear, startMonth, startDay] = start_date.split(/[-/]/).map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);

    // Validate end_date
    if (!dateRegex.test(end_date)) {
        return res.status(400).send("Invalid end_date format, should be yyyy-mm-dd or yyyy/mm/dd");
    }
    const [endYear, endMonth, endDay] = end_date.split(/[-/]/).map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    try {
        // Create new requisition in MongoDB
        const response = await Document.create({
            name,
            user_id: username,
            insert_date: new Date(),
            start_date: startDate,
            end_date: endDate,
            product_id,
            active: true
        });
        console.log("response", response);
        res.status(200).send("Requisition registered");
    } catch (error) {
        console.error(error);
        res.status(400).send("An error occurred registering the requisition");
    }
};