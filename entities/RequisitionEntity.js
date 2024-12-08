exports.RequisitionEntity = class RequisitionEntity {
    constructor(requisition) {
        this.token = requisition.token;
        this.event_name = requisition.event_name;
        this.start_date = requisition.start_date || new Date();
        this.end_date = requisition.end_date || null;
        this.products = requisition.products || [];
        this.active = requisition.active !== undefined ? requisition.active : true;
        this.approved = requisition.approved !== undefined ? requisition.approved : true;
    }

    async validator() {
        if (!this.event_name  || !this.start_date || !this.end_date || !this.products.length>0 ) {
            return { status: 400, message: "All required fields must be provided (event_name, start_date, end_date, products, active, approved)." };
        }

        if (new Date(this.start_date) > new Date(this.end_date)) {
            return { status: 400, message: "start_date cannot be later than end_date." };
        }

        return { status: 200, message: "Requisition is valid." };
    }
};
