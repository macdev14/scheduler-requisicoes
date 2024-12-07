'use strict';

const { 
    userLoginPersistence,
    userCreatePersistence, 
    userChangepwdPersistence, 
    userDeletePersistence, 
    userUnblockPersistence, 
    userEditPersistence, 
    userGetUserByUsername, 
    userGetAll 
} = require("../../use-cases");

const userInteractor = require("../../use-cases/userInteractor");
const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

/**
 * @api {post} /users/register Register User
 * @apiName RegisterUser
 * @apiGroup User
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 * @apiParam {String} email Email
 */
router.post(
    "/register",
    [
        body("username").isString().notEmpty().withMessage("Username is required"),
        body("password").isString().notEmpty().withMessage("Password is required"),
        body("email").isEmail().withMessage("Invalid email address"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, email } = req.body;
        try {
            const result = await userInteractor.register(
                { userCreatePersistence },
                { username, password, email }
            );
            res.status(result.status).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @api {post} /users/login User Login
 * @apiName LoginUser
 * @apiGroup User
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 */
router.post(
    "/login",
    [
        body("username").isString().notEmpty().withMessage("Username is required"),
        body("password").isString().notEmpty().withMessage("Password is required"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        try {
            const result = await userInteractor.login(
                { userLoginPersistence },
                { username, password }
            );
            res.status(result.status).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @api {put} /users/:id Update User Profile
 * @apiName UpdateUserProfile
 * @apiGroup User
 * @apiParam {String} id User ID
 * @apiParam {String} [email] Updated email
 * @apiParam {String} [first_name] Updated first name
 * @apiParam {String} [last_name] Updated last name
 */
router.put(
    "/:id",
    authMiddleware,
    [
        param("id").isMongoId().withMessage("Invalid user ID"),
        body("email").optional().isEmail().withMessage("Invalid email address"),
        body("first_name").optional().isString().withMessage("Invalid first name"),
        body("last_name").optional().isString().withMessage("Invalid last name"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { email, first_name, last_name } = req.body;

        try {
            const result = await userInteractor.userEdit(
                { userEditPersistence },
                { id, email, first_name, last_name }
            );
            res.status(result.status).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @api {delete} /users/:id Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiParam {String} id User ID
 * @apiParam {String} password User password
 */
router.delete(
    "/:id",
    authMiddleware,
    [
        param("id").isMongoId().withMessage("Invalid user ID"),
        body("password").isString().notEmpty().withMessage("Password is required"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { password } = req.body;

        try {
            const result = await userInteractor.userDelete(
                { userDeletePersistence },
                { id, password }
            );
            res.status(result.status).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @api {get} /users/:id Get User by ID
 * @apiName GetUserById
 * @apiGroup User
 * @apiParam {String} id User ID
 */
router.get(
    "/:id",
    authMiddleware,
    [param("id").isMongoId().withMessage("Invalid user ID")],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        try {
            const result = await userInteractor.getByUsername(
                { userGetUserByUsername },
                { id }
            );
            res.status(result.status).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @api {get} /users Get All Users
 * @apiName GetAllUsers
 * @apiGroup User
 */
router.get(
    "/",
    authMiddleware,
    async (req, res, next) => {
        try {
            const result = await userInteractor.getAll(
                { userGetAll },
                { token: req.user.token }
            );
            res.status(result.status).json(result);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
