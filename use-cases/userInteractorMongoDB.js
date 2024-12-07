'use strict';

const UserEntity = require("../entities/userEntity");

const UserInteractorMongoDB = {
    /**
     * Handle user login
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (username, password)
     * @returns {Promise<Object>} Response object
     */
    login: async ({ userLoginPersistence }, { username, password }) => {
        try {
            // Validate input
            if (!username || !password) {
                throw new Error("Username and password are required.");
            }

            // Call the persistence layer
            const user = await userLoginPersistence({ username, password });
            return user;
        } catch (error) {
            console.error("Error in login:", error.message);
            return { status: 400, message: error.message };
        }
    },

    /**
     * Handle user registration
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (username, password, email, etc.)
     * @returns {Promise<Object>} Response object
     */
    register: async ({ userCreatePersistence }, data) => {
        try {
            // Create and validate user entity
            const user = new UserEntity({
                ...data,
                register_date: new Date().toISOString(),
                last_sign_in: new Date().toISOString(),
                active: true,
            });
            user.validate();

            // Call the persistence layer
            const result = await userCreatePersistence(user.toObject());
            return { status: 201, message: "User registered successfully.", data: result };
        } catch (error) {
            console.error("Error in register:", error.message);
            if (error.code === 11000) {
                return { status: 400, message: "User already exists." };
            }
            return { status: 500, message: "Something went wrong." };
        }
    },

    /**
     * Change user password
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (token, oldPassword, newPassword)
     * @returns {Promise<Object>} Response object
     */
    changepwd: async ({ userChangepwdPersistence }, { token, oldPassword, newPassword }) => {
        try {
            if (!token || !oldPassword || !newPassword) {
                throw new Error("Token, old password, and new password are required.");
            }

            const result = await userChangepwdPersistence({ token, oldPassword, newPassword });
            return result;
        } catch (error) {
            console.error("Error in changepwd:", error.message);
            return { status: 400, message: error.message };
        }
    },

    /**
     * Delete a user
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (token, password)
     * @returns {Promise<Object>} Response object
     */
    userDelete: async ({ userDeletePersistence }, { token, password }) => {
        try {
            if (!token || !password) {
                throw new Error("Token and password are required.");
            }

            const result = await userDeletePersistence({ token, password });
            return result;
        } catch (error) {
            console.error("Error in userDelete:", error.message);
            return { status: 400, message: error.message };
        }
    },

    /**
     * Unblock a user
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (token, password)
     * @returns {Promise<Object>} Response object
     */
    userUnblock: async ({ userUnblockPersistence }, { token, password }) => {
        try {
            if (!token || !password) {
                throw new Error("Token and password are required.");
            }

            const result = await userUnblockPersistence({ token, password });
            return result;
        } catch (error) {
            console.error("Error in userUnblock:", error.message);
            return { status: 400, message: error.message };
        }
    },

    /**
     * Edit user details
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (token, email, first_name, etc.)
     * @returns {Promise<Object>} Response object
     */
    userEdit: async ({ userEditPersistence }, data) => {
        try {
            const user = new UserEntity(data);
            user.validate();

            const result = await userEditPersistence(user.toObject());
            return result;
        } catch (error) {
            console.error("Error in userEdit:", error.message);
            return { status: 400, message: error.message };
        }
    },

    /**
     * Get user by username
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (token, username)
     * @returns {Promise<Object>} Response object
     */
    getByUsername: async ({ userGetUserByUsername }, { token, username }) => {
        try {
            if (!token || !username) {
                throw new Error("Token and username are required.");
            }

            const result = await userGetUserByUsername({ token, username });
            return result;
        } catch (error) {
            console.error("Error in getByUsername:", error.message);
            return { status: 400, message: error.message };
        }
    },

    /**
     * Get all users
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Input data (token)
     * @returns {Promise<Object>} Response object
     */
    getAll: async ({ userGetAll }, { token }) => {
        try {
            if (!token) {
                throw new Error("Token is required.");
            }

            const result = await userGetAll({ token });
            return result;
        } catch (error) {
            console.error("Error in getAll:", error.message);
            return { status: 400, message: error.message };
        }
    },
};

module.exports = UserInteractorMongoDB;
