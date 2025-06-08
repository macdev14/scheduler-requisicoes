const { catalogGet, catalogGetById } = require("../../use-cases/catalog/get");
const interactor = require("../../use-cases/catalog/interactor");

const express = require("express");
const router = express.Router();

/**
 * @api {get} /catalog Get a list of available products
 * @apiName GetCatalog
 * @apiGroup Products
 * @apiPermission authenticated user
 * @apiParam {String} start_date Filter by start date
 * @apiParam {String} end_date Filter by end date
 * @apiParam {String} token User token
 * @apiSuccess {Object} List of available products
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/catalog").get(
    async (req, res, next) => {
        const token = req.headers['token'];
        const start_date = req.query.start_date || null;
        const end_date = req.query.end_date || null;
        
        try {

            const catalog = await interactor.getCatalog(
                { catalogGet },
                { token, start_date, end_date }
            );
            res.status(catalog.status).json(catalog);
        } catch (error) {
            next(error);
        }
    }
);
/**
 * @api {get} /catalog/:id Get a product by ID
 * @apiName GetProductById
 * @apiGroup Products
 * @apiPermission authenticated user
 * @apiParam {String} id Product ID
 * @apiParam {String} start_date Filter by start date
 * @apiParam {String} end_date Filter by end date
 * @apiParam {String} token User token
 * @apiSuccess {Object} Product details
 * @apiError {Error} 400 Missing or invalid parameters
 * @apiError {Error} 401 Unauthorized
 * @apiError {Error} 404 Product not found
 * @apiError {Error} 500 Internal Server Error
 */
router.route("/catalog/:id").get(
    async (req, res, next) => {
        const token = req.headers['token'];
        const id = req.params.id;
        const start_date = req.query.start_date || null;
        const end_date = req.query.end_date || null;
        
        try {

            const catalog = await interactor.getCatalogById(
                { catalogGetById },
                { token, id, start_date, end_date }
            );
            res.status(catalog.status).json(catalog);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;