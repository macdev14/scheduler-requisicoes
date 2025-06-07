const { requisitionsCreate } = require("../../use-cases/requisitions/create");
const { requisitionsUpdate} = require("../../use-cases/requisitions/update");
const { requisitionsDelete } = require("../../use-cases/requisitions/delete");
const { requisitionsGet, requisitionsGetById } = require("../../use-cases/requisitions/get");
const { requisitionsReview } = require("../../use-cases/requisitions/review");
const  interactor  = require("../../use-cases/requisitions/interactor");

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
                { requisitionsCreate},
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
        const { id } = req.body;
        try {
            
            const requisition = await interactor.getRequisitions(
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
router.route("/requisitions").put(

    async (req, res, next) => {
        const {id, event_name, start_date, end_date, approved, active, products } = req.body;
        const token = req.headers['token'];
        try {

            const requisition = await interactor.updateRequisitions(
                { requisitionsUpdate },
                { id, event_name, start_date, end_date, approved, active, products, token }
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
        const { id } = req.body;
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
 * @api {get} /requisitions Get All Requisitions
 * @apiName GetAllRequisitions
 * @apiGroup Requisition
 */
router.route("/requisitions").get(
    async (req, res, next) => {
        const token = req.headers['token'];
        try {
            
            const requisitions = await interactor.getRequisitions(
                { requisitionsGet },
                { token }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);

router.route("/requisitions/veredict").post(
    async (req, res, next) => {
        const token = req.headers['token'];
        const { id, products } = req.body;
        console.log(products)
        
        try {
            const requisitions = await interactor.reviewRequisitions(
                { requisitionsReview },
                { token, id, products }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);




module.exports = router;

