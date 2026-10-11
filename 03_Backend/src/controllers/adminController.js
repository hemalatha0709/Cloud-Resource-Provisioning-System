const adminModel = require("../models/adminModel");

// Get All Resource Requests

const getAllResourceRequests = async (req, res) => {

    try {

        const requests = await adminModel.getAllRequests();

        res.status(200).json(requests);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// Approve Resource Request

const approveRequest = async (req, res) => {

    try {

        const { id } = req.params;

const adminId = req.user.user_id;

const { expiry_date } = req.body;

const result = await adminModel.approveRequest(
    id,
    adminId,
    expiry_date
);
        


        if (!result) {

            return res.status(404).json({
                message: "Request not found"
            });

        }


        res.status(200).json({

            message: "Request approved and resource allocated successfully",

            request: result.request,

            resource: result.resource

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            message: "Server error"
        });

    }

};

// Reject Resource Request

const rejectRequest = async (req, res) => {

    try {

        const { id } = req.params;

        const adminId = req.user.user_id;

        const request = await adminModel.rejectRequest(
            id,
            adminId
        );

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        res.status(200).json({
            message: "Request rejected successfully",
            request
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getAllResourceRequests,
    approveRequest,
    rejectRequest
};