import { admindb } from "../models/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";
import { reversaldb } from "../models/reversals.js";

export const createAdmin = async (req,res) => {
    try {
        const {fullname, email, password, role} = req.body;
        if (!email || !fullname || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        let admin = await admindb.findOne({ email });
        if (admin) {
            return res.status(400).json({
                message: "Admin email already exists",
                success: false
            });
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                admin = await admindb.create({
                    email,
                    fullname,
                    password: hash,
                    role
                });
            });
        });

        return res.status(200).json({
            message: "Admin Created Successfully",
            success: true
        });
    } catch (error) {
        dbgr(error.message);
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await admindb.findOne({ email });

        if (!admin) return res.status(400).json({ message: "Invalid credentials", success: false });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({
            message: "Invalid credentials",
            success: false
        });

        // Generate token
        let token = generateToken(admin);
        res.status(200).cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: "Logged in successfully",
            admin,
            success: true
        });

    } catch (error) {
        dbgr(error.message);
    }
};

export const getAllReversals = async (req, res) => {
    try {
        const reversals = await reversaldb.find({ status: "pending" }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Reversals fetched successfully", reversals, success: true });
    } catch (error) {
        dbgr(error.message);
    }
};