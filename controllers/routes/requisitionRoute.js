const { requisitionsCreate } = require("../../use-cases/requisitions/create");
const { requisitionsUpdate } = require("../../use-cases/requisitions/update");
const { requisitionsDelete } = require("../../use-cases/requisitions/delete");
const { requisitionsRestore } = require("../../use-cases/requisitions/restore");
const { requisitionsGet, requisitionsGetById } = require("../../use-cases/requisitions/get");
const { requisitionsReview } = require("../../use-cases/requisitions/review");
const interactor = require("../../use-cases/requisitions/interactor");

const express = require("express");

const router = express.Router();


/**
 * @api {post} /requisitions Create a requisition
 * @apiName CreateRequisition
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {String} event_name Event name
 * @apiParam {Date} start_date Start date of the event
 * @apiParam {Date} end_date End date of the event
 * @apiParam {Object} required_products Required products
 * @apiParam {String} address Address
 * @apiParam {String} token User token
 * @apiSuccess {Object} Requisition created successfully
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions").post(

    async (req, res, next) => {

        const { event_name, start_date, end_date, required_products, address } = req.body;
        const token = req.headers['token'];


        try {
            const requisition = await interactor.createRequisitions(
                { requisitionsCreate },
                { token, event_name, start_date, end_date, required_products, address }
            );
            res.status(requisition.status).json(requisition);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * @api {get} /requisitions/:id Get a requisition by ID
 * @apiName GetRequisitionById
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {String} id Requisition ID
 * @apiParam {String} token User token
 * @apiSuccess {Object} Requisition
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 404 Requisition not found
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions/:id").get(
    async (req, res, next) => {
        const token = req.headers['token'];
        const { id } = req.params;
        try {

            const requisition = await interactor.getRequisitionsById(
                { requisitionsGetById },
                { id, token }
            );
            res.status(requisition.status).json(requisition);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * @api {put} /requisitions/:id Update a requisition
 * @apiName UpdateRequisition
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {String} id Requisition ID
 * @apiParam {String} event_name Event name
 * @apiParam {Date} start_date Start date of the event
 * @apiParam {Date} end_date End date of the event
 * @apiParam {Object} required_products Required products
 * @apiParam {String} address Address
 * @apiParam {String} token User token
 * @apiSuccess {Object} Requisition updated successfully
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 404 Requisition not found
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions/:id").put(

    async (req, res, next) => {
        const { event_name, start_date, end_date, required_products, address } = req.body;
        const token = req.headers['token'];
        const id = req.params.id;
        try {

            const requisition = await interactor.updateRequisitions(
                { requisitionsUpdate },
                { id, event_name, start_date, end_date, required_products, address, token }
            );
            res.status(requisition.status).json(requisition);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * @api {patch} /requisitions/:id/delete Soft delete a requisition
 * @apiName DeleteRequisition
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {String} id Requisition ID
 * @apiParam {String} token User token
 * @apiSuccess {Object} Requisition deleted successfully
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 404 Requisition not found
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions/:id/delete").patch(
    async (req, res, next) => {
        const id = req.params.id;
        const token = req.headers['token'];
        try {
            const requisition = await interactor.deleteRequisitions(
                { requisitionsDelete },
                { id, token }
            );
            res.status(requisition.status).json(requisition);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * @api {patch} /requisitions/:id/restore Restore a soft deleted requisition
 * @apiName RestoreRequisition
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {String} id Requisition ID
 * @apiParam {String} token User token
 * @apiSuccess {Object} Requisition restored successfully
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 404 Requisition not found
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions/:id/restore").patch(
    async (req, res, next) => {
        const id = req.params.id;
        const token = req.headers['token'];
        try {
            const requisition = await interactor.restoreRequisitions(
                { requisitionsRestore },
                { id, token }
            );
            res.status(requisition.status).json(requisition);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * @api {get} /requisitions Get a list of requisitions
 * @apiName GetRequisitions
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {Number} page Page number
 * @apiParam {Number} limit Number of items per page
 * @apiParam {String} search Search by event name
 * @apiParam {Boolean} approved Filter by approval status
 * @apiParam {String} user_id Filter by user ID
 * @apiParam {Date} start_date Filter by start date
 * @apiParam {Date} end_date Filter by end date
 * @apiParam {Boolean} active Filter by active status
 * @apiParam {String} token User token
 * @apiSuccess {Object} List of requisitions
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions").get(
    async (req, res, next) => {
        const token = req.headers['token'];

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const approved = req.query.approved || null;
        const user_id = req.query.user_id || null;
        const start_date = req.query.start_date || null;
        const end_date = req.query.end_date || null;
        const active = req.query.active || null;
        try {

            const requisitions = await interactor.getRequisitions(
                { requisitionsGet },
                { token, page, limit, search, approved, user_id, start_date, end_date, active }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * @api {patch} /requisitions/:id/review Review a requisition
 * @apiName ReviewRequisition
 * @apiGroup Requisitions
 * @apiPermission authenticated user
 * @apiParam {String} id Requisition ID
 * @apiParam {String} review Review text
 * @apiParam {String} token User token
 * @apiSuccess {Object} Requisition reviewed successfully
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 404 Requisition not found
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/requisitions/:id/review").patch(
    async (req, res, next) => {
        const token = req.headers['token'];
        const id = req.params.id;
        const review = req.body.review;

        try {
            const requisitions = await interactor.reviewRequisitions(
                { requisitionsReview },
                { token, id, review }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);




module.exports = router;

