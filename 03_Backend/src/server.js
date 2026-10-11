const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./config/database");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const resourceTypeRoutes = require("./routes/resourceTypeRoutes");
const providerRoutes = require("./routes/providerRoutes");
const resourceNameRoutes =require("./routes/resourceNameRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resource-types", resourceTypeRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/resource-names",resourceNameRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
    res.send("Cloud Resource Management API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});