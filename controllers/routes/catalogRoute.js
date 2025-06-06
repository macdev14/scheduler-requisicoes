
const express = require("express");
const router = express.Router();

router.route("/requisition/catalog").get(
    async (req, res, next) => {
        const token = req.headers['token'];
        const { start_date, end_date } = req.body;
        
        try {

            const requisitions = await requisitionInteractorMongoDB.getCatalog(
                { requisitionGetCatalog },
                { token, start_date, end_date }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;