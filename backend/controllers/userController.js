import debug from 'debug';
import bcrypt from 'bcrypt';
import { userdb } from '../models/user.js';
import { generateToken } from '../utils/generateToken.js';
const dbgr = debug("development:userController");

export const userRegister = async (req,res) => {
    try{
        let {fullname, contact, password, account_number} = req.body;
        if (!fullname || !contact || !password || !account_number){
            return res.status(400).json({
                message : "Something is missing",
                success : false
            });
        }

        let user = await userdb.findOne({account_number});
        if (user){
            return res.status(400).json({
                message: "User email already exists",
                success: false
            });
        }

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,async (err,hash) => {
                user = await userdb.create({
                    fullname,
                    contact,
                    password : hash,
                    account_number
                });
            });
        });

        return res.status(200).json({
            message : "User Created Successfully",
            success : true 
        });
    }
    catch(err){
        dbgr(err.message);
    }
} 

export const userLogin = async (req,res) => {
    try {
        let {account_number, password} = req.body;
        if (!password || !account_number){
            return res.status(400).json({
                message : "Something is missing",
                success : false
            });
        }

        let user = await userdb.findOne({account_number});
        if (!user){
            return res.status(400).json({
                message: "Email or Password incorrect",
                success: false
            });
        }

        const result = await bcrypt.compare(password, user.password);

        if (!result) {
            return res.status(400).json({
                message: "Email or Password Incorrect",
                success: false
            });
        }

        user = {
            _id: user._id,
            account_number,
            fullname: user.fullname,
            contact: user.contact,
        }

        let token = generateToken(user);
        res.status(200).cookie("token",token, { maxAge: 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        });

    } catch (error) {
        dbgr(error.message);
    }
}