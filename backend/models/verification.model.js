import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const verificationSchema = new mongoose.Schema(
    {
        email: { required: true, type: String },
        otpCode: {
            required: true,
            type: String,
        },
    },
    { timestamps: true }
);

// Hash the otp before saving the user model
verificationSchema.pre("save", async function (next) {
    const verification = this;
    if (verification.isModified("otpCode")) {
        verification.otpCode = await bcryptjs.hash(verification.otpCode, 10);
    }
    next();
});

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
