const pool = require("../config/database");


// Get all users
const getUsers = async (req,res)=>{

    try{

        const result = await pool.query(
            "SELECT user_id, username, full_name, email, role_id, status FROM users"
        );

        res.json(result.rows);

    }
    catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};


module.exports = {
    getUsers
};