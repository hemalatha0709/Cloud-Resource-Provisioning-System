const requestModel = require("../models/requestModel");


// Create Resource Request

const createResourceRequest = async (req,res)=>{

    try{

        const data = {

            user_id: req.user.user_id,

            type_id: req.body.type_id,

            provider_id: req.body.provider_id,

            resource_name: req.body.resource_name,

            cpu_cores: req.body.cpu_cores,

            memory_gb: req.body.memory_gb,

            storage_gb: req.body.storage_gb,

            justification: req.body.justification

        };


        const request =
        await requestModel.createRequest(data);


        res.status(201).json({

            message:"Resource request created successfully",

            request

        });


    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};

// Get Logged-in User Requests

const getMyResourceRequests = async (req, res) => {

    try {

        const requests = await requestModel.getMyRequests(
            req.user.user_id
        );

        res.status(200).json(requests);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getResourceNames = async (req, res) => {

    try {

        const resourceNames =
            await requestModel.getResourceNames();

        res.status(200).json({
            success: true,
            resourceNames
        });

    } catch (error) {

        console.error(
            "Error fetching resource names:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch resource names"
        });

    }
};

module.exports = {
    createResourceRequest,
    getMyResourceRequests,
    getResourceNames
};