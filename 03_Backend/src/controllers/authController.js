const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// =========================================================
// REGISTER USER
// =========================================================

const register = async (req, res) => {

    try {

        const {
            username,
            full_name,
            email,
            password
        } = req.body;


        // -------------------------------------------------
        // Validate required fields
        // -------------------------------------------------

        if (
            !username ||
            !full_name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }


        // -------------------------------------------------
        // Check if email already exists
        // -------------------------------------------------

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (existingUser.rows.length > 0) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }


        // -------------------------------------------------
        // Encrypt password
        // -------------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // -------------------------------------------------
        // Always create normal Cloud User
        // role_id = 2
        // -------------------------------------------------

        const CLOUD_USER_ROLE_ID = 2;


        // -------------------------------------------------
        // Insert new user
        // -------------------------------------------------

        await pool.query(
            `
            INSERT INTO users
            (
                username,
                full_name,
                email,
                password_hash,
                role_id,
                status
            )
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
            `,
            [
                username,
                full_name,
                email,
                hashedPassword,
                CLOUD_USER_ROLE_ID
            ]
        );


        res.status(201).json({
            message: "User registered successfully"
        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            message: "Server error during registration"
        });

    }

};


// =========================================================
// LOGIN USER
// =========================================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // -------------------------------------------------
        // Find user by email
        // -------------------------------------------------

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (result.rows.length === 0) {

            return res.status(400).json({
                message: "Invalid Email"
            });

        }


        const user = result.rows[0];


        // -------------------------------------------------
        // Check password
        // -------------------------------------------------

        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!validPassword) {

            return res.status(400).json({
                message: "Invalid Password"
            });

        }


        // -------------------------------------------------
        // Check account status
        // -------------------------------------------------

        if (user.status !== "ACTIVE") {

            return res.status(403).json({
                message: "Your account is not active"
            });

        }


        // -------------------------------------------------
        // Create JWT
        // -------------------------------------------------

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role_id: user.role_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        // -------------------------------------------------
        // Send safe user information
        // Do NOT send password_hash
        // -------------------------------------------------

        const loggedInUser = {

            user_id: user.user_id,

            username: user.username,

            full_name: user.full_name,

            email: user.email,

            role_id: user.role_id,

            status: user.status

        };


        res.json({

            message: "Login Successful",

            token,

            user: loggedInUser

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            message: "Server error during login",

            error: error.message

        });

    }

};


module.exports = {

    register,

    login

};