exports.RequisitionEntity = class RequisitionEntity {
    constructor(requisition) {
        this.name = requisition.name;
        this.user_id = requisition.user_id;
        this.insert_date = requisition.insert_date || new Date();
        this.description = requisition.description || null;
        this.start_date = requisition.start_date || null;
        this.end_date = requisition.end_date || null;
        this.product_id = requisition.product_id || null;
        this.active = requisition.active !== undefined ? requisition.active : true;
    }

    async validator() {
        if (!this.name || !this.user_id || !this.start_date || !this.end_date || !this.product_id) {
            return { status: 400, message: "All required fields must be provided (name, user_id, start_date, end_date, product_id)." };
        }

        if (new Date(this.start_date) > new Date(this.end_date)) {
            return { status: 400, message: "start_date cannot be later than end_date." };
        }

        return { status: 200, message: "Requisition is valid." };
    }
};
