'use strict';
exports.getCatalog = async ({ catalogGet }, { token, start_date, end_date }) => {
    try {

        const catalog = await catalogGet({ token, start_date, end_date });
        return catalog ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};

exports.getCatalogById = async ({ catalogGetById }, { token, id, start_date, end_date }) => {
    try {

        const catalog = await catalogGetById({ token, id, start_date, end_date });
        return catalog ;
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Something went wrong: " + error };
    }
};