const pool = require("../config/database");


// =========================================================
// GET PROFILE
// =========================================================

const getProfile = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            user_id,
            username,
            full_name,
            email,
            role_id,
            status,
            created_at
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};


// =========================================================
// UPDATE PROFILE
// =========================================================

const updateProfile = async (
    userId,
    username,
    fullName,
    email
) => {

    const result = await pool.query(
        `
        UPDATE users
        SET
            username = $1,
            full_name = $2,
            email = $3
        WHERE user_id = $4
        RETURNING
            user_id,
            username,
            full_name,
            email,
            role_id,
            status,
            created_at
        `,
        [
            username,
            fullName,
            email,
            userId
        ]
    );

    return result.rows[0];
};


// =========================================================
// GET CURRENT PASSWORD HASH
// =========================================================

const getPasswordHash = async (userId) => {

    const result = await pool.query(
        `
        SELECT password_hash
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};


// =========================================================
// UPDATE PASSWORD
// =========================================================

const updatePassword = async (
    userId,
    newPasswordHash
) => {

    await pool.query(
        `
        UPDATE users
        SET password_hash = $1
        WHERE user_id = $2
        `,
        [
            newPasswordHash,
            userId
        ]
    );
};


module.exports = {
    getProfile,
    updateProfile,
    getPasswordHash,
    updatePassword
};