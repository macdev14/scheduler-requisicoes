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

        const { event_name, start_date, end_date, approved, active, products } = req.body;
       
       
        
        try {
            const token = req.headers['token'];
            console.log(token)
            if(!token || token==undefined || token==null){
                throw new Error("token required");
            }
            const requisition = await requisitionInteractorMongoDB.create(
                { requisitionCreatePersistence },
                { token, event_name, start_date, end_date, approved, active, products }
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

        const { id } = req.body;
        try {
            const token = req.headers['token'];
            const requisition = await requisitionInteractorMongoDB.getById(
                { requisitionGetByIdPersistence },
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
router.route("/requisition/update").put(

    async (req, res, next) => {

       
     

        try {
            const {id, event_name, start_date, end_date, approved, active, products } = req.body;
            const token = req.headers['token'];
            console.log("token", token);
            console.log("requisition", req.body);
            const requisition = await requisitionInteractorMongoDB.update(
                { requisitionUpdatePersistence },
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
router.route("/requisition/delete").put(
    async (req, res, next) => {
 
        const { id } = req.body;
        const token = req.headers['token'];
        try {
            const requisition = await requisitionInteractorMongoDB.delete(
                { requisitionDeletePersistence },
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
router.route("/requisition/getAll").get(
    async (req, res, next) => {
        
        try {
            const token = req.headers['token'];
            const active = true;
            const requisitions = await requisitionInteractorMongoDB.getAll(
                { requisitionGetAllPersistence },
                { active, token }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
