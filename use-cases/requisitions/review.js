'use strict';
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require('moment');
require('dotenv').config();
require("../../framework/db/mongoDB/models/requisitionModel");
const Requisition = mongoose.model("Requisition");


exports.requisitionsReview = async ({ token, id, review }) => {
    try {
        if (!token || !id || !review) {
            return { status: 400, message: "token, id and review are required" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { status: 400, message: "id is not a valid id" };
        }

        let booleanReview;
        if (typeof review === 'string') {
            switch (review.toLowerCase()) {
                case 'true':
                    booleanReview = true;
                    break;
                case 'false':
                    booleanReview = false;
                    break;
                default:
                    return { status: 400, message: "review must be a boolean" };
            }
        } else if (typeof review === 'boolean') {
            booleanReview = review;
        } else {
            return { status: 400, message: "review must be a boolean" };
        }


        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (decoded.role == process.env.ROLE_ADMIN || decoded.role == process.env.ROLE_MANAGER) {
                const requisition = await Requisition.updateOne(
                    { _id: id, active: true },
                    {
                        $set: {
                            approved: review,
                            reviewed_by: decoded.id,
                            reviewed_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                );

                if (!requisition) {
                    return { status: 404, message: "Requisition not found" };
                }

                return { status: 200, message: "Requisition deleted successfully", data: requisition };
            }

            return ({ status: 403, message: "Access denied. Insufficient permissions." });
        } catch (err) {
            console.log("err", err);
            return ({ status: 403, message: "Access denied" });
        }

    } catch (error) {
        console.log("error", error);
        return { status: 500, message: "Something went wrong" };
    }
};
