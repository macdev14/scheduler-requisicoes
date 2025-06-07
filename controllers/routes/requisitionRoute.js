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
 * @api {post} /requisitions Create Requisition
 * @apiName CreateRequisition
 * @apiGroup Requisition
 * @apiParam {String} title Requisition title
 * @apiParam {String} description Requisition description
 * @apiParam {String} token JSON Web Token for authentication
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
 * @api {get} /requisitions/:id Get Requisition by ID
 * @apiName GetRequisitionById
 * @apiGroup Requisition
 * @apiParam {String} id Requisition ID
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
 * @api {put} /requisitions/:id Update Requisition
 * @apiName UpdateRequisition
 * @apiGroup Requisition
 * @apiParam {String} id Requisition ID
 * @apiParam {String} title Requisition title
 * @apiParam {String} description Requisition description
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
 * @api {delete} /requisitions/:id Delete Requisition
 * @apiName DeleteRequisition
 * @apiGroup Requisition
 * @apiParam {String} id Requisition ID
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
 * @api {get} /requisitions Get All Requisitions
 * @apiName GetAllRequisitions
 * @apiGroup Requisition
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

