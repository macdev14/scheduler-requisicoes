exports.EventJwtEntity = class RequsitionJwtEntity {
    constructor(requisition, token) {
        this.token = token;
        this.name = requisition.name;
        this.user_id = requisition.user_id;
        this.insert_date = requisition.insert_date || new Date();
        this.description = requisition.description || null;
        this.start_date = requisition.start_date || null;
        this.end_date = requisition.end_date || null;
        this.product_id = requisition.product_id || null;
        this.active = requisition.active !== undefined ? requisition.active : true;
    }
};