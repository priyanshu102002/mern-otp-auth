import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Hash the password before saving the user model
// userSchema.pre() is a middleware function that runs before saving a document
userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcryptjs.hash(user.password, 10);
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
