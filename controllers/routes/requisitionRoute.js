const { requisitionCreatePersistence } = require("../../use-cases/requisitionCreatePersistence");
const { requisitionUpdatePersistence} = require("../../use-cases/requisitionUpdatePersistence");
const { requisitionDeletePersistence } = require("../../use-cases/requisitionDeletePersistence");
const { requisitionGetByIdPersistence } = require("../../use-cases/requisitionGetByIdPersistence");
const { requisitionGetAllPersistence } = require("../../use-cases/requisitionGetAllPersistence");
const  requisitionInteractorMongoDB  = require("../../use-cases/requisitionInteractorMongoDB");

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
router.route("/requisition/create").post(
  
    async (req, res, next) => {

        const { event_name, start_date, end_date, Products, approved, active, products } = req.body;
        const token = req.headers['token'];
        if(!token){
            return { status: 400, message: "token required" };
        }
        console.log(req.body)
        try {
            const requisition = await requisitionInteractorMongoDB.create(
                { requisitionCreatePersistence },
                { token, event_name, start_date, end_date, Products, approved, active, products }
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
router.route("/requisition/getById").get(
    async (req, res, next) => {

        const { id } = req.params;
        try {
            const requisition = await requisitionInteractorMongoDB.getById(
                { requisitionGetByIdPersistence },
                { id }
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
router.route("/requisition/update").put(

    async (req, res, next) => {

        const { id } = req.params;
        const { title, description } = req.body;

        try {
            const requisition = await requisitionInteractorMongoDB.update(
                { requisitionUpdatePersistence },
                { id, title, description, updatedBy: req.user.id }
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
router.route("/requisition/delete").delete(
    async (req, res, next) => {
 
        const { id } = req.body;
        try {
            const requisition = await requisitionInteractorMongoDB.delete(
                { requisitionDeletePersistence },
                { id, deletedBy: req.user.id }
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
router.route("/requisition/getAll").get(
    async (req, res, next) => {
        
        try {
            const token = req.headers['token'];
            const requisitions = await requisitionInteractorMongoDB.getAll(
                { requisitionGetAllPersistence },
                { token }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
