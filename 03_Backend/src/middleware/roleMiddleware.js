const checkAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (Number(req.user.role_id) !== 1) {
        return res.status(403).json({
            message: "Access denied. Admin only"
        });
    }

    next();
};

module.exports = checkAdmin;