import errorHandler from "../middlewares/errorHandler.js";
import mailer from "../middlewares/mailer.middleware.js";
import Verification from "../models/verification.model.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const otpSend = async (req, res, next) => {
    const { email } = req.body;

    if (!email) return errorHandler(400, "Email is required");

    try {
        // Generate Otp
        const otpCode = Math.floor(100000 + Math.random() * 900000);

        // Send email and Otp to mailer middleware
        const isSent = await mailer(email, otpCode);

        if (!isSent) {
            next(errorHandler(500, "Email not sent"));
        }

        // Delete previous Otp if exists having same email
        await Verification.deleteMany({ email });

        // Save Otp in database
        const newVerification = await Verification.create({ email, otpCode });
        await newVerification.save();

        return res.status(200).json({
            success: true,
            message: "Otp sent successfully",
            email,
        });
    } catch (error) {
        next(errorHandler(500, error.message));
    }
};

export const register = async (req, res, next) => {
    const { email, username, password, otpCode, profilePicture } = req.body;

    try {
        if (!email || !username || !password || !otpCode) {
            next(errorHandler(400, "All fields are required"));
        }

        // User already exists
        let user = await User.findOne({ email });

        if (user) {
            next(errorHandler(400, "User already exists"));
        }

        // Verification model me ye email hona chahiye (agr otp send hua hoga to)
        const verificationQueue = await Verification.findOne({ email });
        if (!verificationQueue) {
            next(errorHandler(400, "Please send the otp first"));
        }

        // Verify Otp
        const verifyOtp = await bcryptjs.compare(
            otpCode,
            verificationQueue.otpCode
        );
        if (!verifyOtp) {
            next(errorHandler(400, "Invalid Otp"));
        }

        // Create new user
        const newUser = await User.create({
            email,
            username,
            password,
            profilePicture,
        });
        console.log(newUser);

        // Delete verification queue
        await Verification.deleteMany({ email });

        const { password: pass, ...rest } = newUser._doc;

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            rest,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            next(errorHandler(400, "All fields are required"));
        }

        const user = await User.findOne({ email });

        if (!user) {
            next(errorHandler(400, "User not found"));
        }

        // Verify password
        const verifyPassword = await bcryptjs.compare(password, user.password);
        if (!verifyPassword) {
            next(errorHandler(400, "Invalid password"));
        }

        // Generate token
        const authToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "10d" }
        );

        // Set cookie in response
        res.cookie("auth_token", authToken, { httpOnly: true });
        res.cookie("refresh_token", refreshToken, { httpOnly: true });

        const { password: pass, ...rest } = user._doc;

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            rest,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("auth_token");
        res.clearCookie("refresh_token");
        return res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};

// logout
// update user
