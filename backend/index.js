import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import bodyParser from "body-parser";

dotenv.config();
const PORT = process.env.PORT || 8001;

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

// Error handler middleware 
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        statusCode
    })
})

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB connected");
    })
    .catch((err) => {
        console.log("DB connection error: ", err);
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
