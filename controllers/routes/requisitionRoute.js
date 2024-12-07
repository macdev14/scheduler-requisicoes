const { 
    requisitionPersistence, 
    requisitionCreatePersistence, 
    requisitionUpdatePersistence, 
    requisitionDeletePersistence, 
    requisitionGetByIdPersistence, 
    requisitionGetAllPersistence 
} = require("../../use-cases");

const requisitionInteractorMongoDB = require("../../use-cases/requisitionInteractorMongoDB");
const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

/**
 * @api {post} /requisitions Create Requisition
 * @apiName CreateRequisition
 * @apiGroup Requisition
 * @apiParam {String} title Requisition title
 * @apiParam {String} description Requisition description
 * @apiParam {String} token JSON Web Token for authentication
 */
router.post(
    "/",
    authMiddleware,
    [
        body("title").isString().notEmpty().withMessage("Title is required"),
        body("description").isString().notEmpty().withMessage("Description is required"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description } = req.body;
        try {
            const requisition = await requisitionInteractorMongoDB.create(
                { requisitionCreatePersistence },
                { title, description, createdBy: req.user.id }
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
router.get(
    "/:id",
    authMiddleware,
    [param("id").isMongoId().withMessage("Invalid requisition ID")],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
router.put(
    "/:id",
    authMiddleware,
    [
        param("id").isMongoId().withMessage("Invalid requisition ID"),
        body("title").optional().isString().withMessage("Invalid title"),
        body("description").optional().isString().withMessage("Invalid description"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
router.delete(
    "/:id",
    authMiddleware,
    [param("id").isMongoId().withMessage("Invalid requisition ID")],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
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
router.get(
    "/",
    authMiddleware,
    async (req, res, next) => {
        try {
            const requisitions = await requisitionInteractorMongoDB.getAll(
                { requisitionGetAllPersistence },
                { createdBy: req.user.id }
            );
            res.status(requisitions.status).json(requisitions);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
