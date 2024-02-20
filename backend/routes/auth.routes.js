import express from "express";
import {
    login,
    logout,
    otpSend,
    register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", (req, res, next) => {
    res.send("Testing the auth route");
});

router.post("/sendotp", otpSend);
router.post("/register", register);
router.post("/login", login);
router.delete("/logout", logout);

export default router;
