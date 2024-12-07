const { RequisitionEntity } = require("../entities/RequisitionEntity");

const requisitionInteractorMongoDB = {
    /**
     * Create a new requisition
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} data - Requisition data
     */
    create: async ({ requisitionCreatePersistence }, { title, description, createdBy }) => {
        try {
            const requisition = new RequisitionEntity({ title, description, createdBy });
            
            if (!requisition.validate()) {
                return { status: 400, message: "Invalid requisition data" };
            }

            const result = await requisitionCreatePersistence(requisition);
            return { status: 201, message: "Requisition created successfully", data: result };
        } catch (error) {
            console.error("Error creating requisition:", error);
            return { status: 500, message: "Internal server error" };
        }
    },

    /**
     * Get a requisition by its ID
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} params - Query parameters
     */
    getById: async ({ requisitionGetByIdPersistence }, { id }) => {
        try {
            const requisition = await requisitionGetByIdPersistence(id);
            if (!requisition) {
                return { status: 404, message: "Requisition not found" };
            }
            return { status: 200, message: "Requisition retrieved successfully", data: requisition };
        } catch (error) {
            console.error("Error retrieving requisition:", error);
            return { status: 500, message: "Internal server error" };
        }
    },

    /**
     * Update a requisition by its ID
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} params - Data to update
     */
    update: async ({ requisitionUpdatePersistence }, { id, title, description, updatedBy }) => {
        try {
            const updatedData = {};
            if (title) updatedData.title = title;
            if (description) updatedData.description = description;
            updatedData.updatedBy = updatedBy;
            updatedData.updatedAt = new Date();

            const result = await requisitionUpdatePersistence(id, updatedData);

            if (!result) {
                return { status: 404, message: "Requisition not found" };
            }

            return { status: 200, message: "Requisition updated successfully", data: result };
        } catch (error) {
            console.error("Error updating requisition:", error);
            return { status: 500, message: "Internal server error" };
        }
    },

    /**
     * Delete a requisition by its ID
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} params - ID of the requisition
     */
    delete: async ({ requisitionDeletePersistence }, { id, deletedBy }) => {
        try {
            const result = await requisitionDeletePersistence(id, deletedBy);

            if (!result) {
                return { status: 404, message: "Requisition not found" };
            }

            return { status: 200, message: "Requisition deleted successfully" };
        } catch (error) {
            console.error("Error deleting requisition:", error);
            return { status: 500, message: "Internal server error" };
        }
    },

    /**
     * Get all requisitions
     * @param {Object} dependencies - Persistence dependencies
     * @param {Object} params - Query parameters
     */
    getAll: async ({ requisitionGetAllPersistence }, { createdBy }) => {
        try {
            const requisitions = await requisitionGetAllPersistence(createdBy);

            if (!requisitions || requisitions.length === 0) {
                return { status: 404, message: "No requisitions found" };
            }

            return { status: 200, message: "Requisitions retrieved successfully", data: requisitions };
        } catch (error) {
            console.error("Error retrieving requisitions:", error);
            return { status: 500, message: "Internal server error" };
        }
    },
};

module.exports = requisitionInteractorMongoDB;
