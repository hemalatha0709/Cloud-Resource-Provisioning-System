const bcrypt = require("bcrypt");

const profileModel = require("../models/profileModel");


// =========================================================
// GET PROFILE
// =========================================================

const getProfile = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const profile =
            await profileModel.getProfile(userId);

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.json(profile);

    } catch (error) {

        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};


// =========================================================
// UPDATE PROFILE
// =========================================================

const updateProfile = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const {
            username,
            full_name,
            email
        } = req.body;


        if (!username || !full_name || !email) {

            return res.status(400).json({
                message: "Username, full name and email are required"
            });
        }


        // Check whether username/email belongs to another user
        const existingUser = await require("../config/database").query(
            `
            SELECT user_id
            FROM users
            WHERE (username = $1 OR email = $2)
            AND user_id != $3
            `,
            [
                username,
                email,
                userId
            ]
        );


        if (existingUser.rows.length > 0) {

            return res.status(400).json({
                message: "Username or email already exists"
            });
        }


        const updatedProfile =
            await profileModel.updateProfile(
                userId,
                username,
                full_name,
                email
            );


        res.json({
            message: "Profile updated successfully",
            user: updatedProfile
        });

    } catch (error) {

        console.error("Update profile error:", error);

        res.status(500).json({
            message: "Failed to update profile"
        });
    }
};


// =========================================================
// CHANGE PASSWORD
// =========================================================

const changePassword = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const {
            current_password,
            new_password
        } = req.body;


        if (!current_password || !new_password) {

            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }


        if (new_password.length < 6) {

            return res.status(400).json({
                message: "New password must contain at least 6 characters"
            });
        }


        const user =
            await profileModel.getPasswordHash(userId);


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }


        const validPassword =
            await bcrypt.compare(
                current_password,
                user.password_hash
            );


        if (!validPassword) {

            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }


        const newPasswordHash =
            await bcrypt.hash(
                new_password,
                10
            );


        await profileModel.updatePassword(
            userId,
            newPasswordHash
        );


        res.json({
            message: "Password changed successfully"
        });

    } catch (error) {

        console.error("Change password error:", error);

        res.status(500).json({
            message: "Failed to change password"
        });
    }
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword
};