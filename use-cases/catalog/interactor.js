'use strict';
exports.getCatalog = async ({ requisitionGetCatalog }, { token, start_date, end_date }) => {
    try {

        const requisitions = await requisitionGetCatalog({ token, start_date, end_date });
        return requisitions ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};