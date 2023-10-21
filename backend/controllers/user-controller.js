import User from "../models/User";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

export const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (error) {
        console.log(error);
    }

    if (!users) {
        return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ users });
}

export const signup = async (req, res, next) => {
    const { name, email, password, gender, country } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (error) {
        console.log(error);
    }

    if (existingUser) {
        return res.status(400).json({ messgae: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        gender,
        country,
        blogs: [],
    });

    try {
        const result = await user.save();
    } catch (error) {
        console.log(error);
    }

    // if(false == result) {
    //     return res.status(400).json({message: "Failed to save user."});
    // }
    return res.status(201).json({ user });
}

export const login = async(req, res, next) => {
    const {email, password} = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (error) {
        console.log(error);
    }

    if (!existingUser) {
        return res.status(404).json({ messgae: "Email or password is incorrect." });
    }

    const isPassCorrect = bcrypt.compareSync(password, existingUser.password);
    if(false == isPassCorrect) {
        return res.status(404).json({message: "Email or password is incorrect."});
    }

    let token;
    try {
        token = jwt.sign({_id: existingUser.id.toString()}, process.env.SECRET_KEY);
        //existingUser.tokens.push(token);
        existingUser.tokens = existingUser.tokens.concat({token: token});
        await existingUser.save();
        res.cookie("SMP", token, {
            expires: new Date(Date.now() + 6000000),
            httpOnly: true,
            secure: false,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({messgae: "Failed to login due to internal errors. Please try again."});
    }

    return res.status(200).json({message: "Login successfull!!"});
}

export const logoutUser = async(req,res,next) => {
    const signedUser = req.user;

    let token = req.cookies["SMP"];
    if(token == null) {
        return res.status(200).json({message: "User is already logged out."});
    }

    try {
        signedUser.tokens = []; //logout from all devices
        res.clearCookie("SMP");
        await signedUser.save();
    } catch (error) {
        console.log(error);
        res.clearCookie("SMP");
        return res.status(400).json({message: "We have faced some internal errors. Please try again."});
    }
    return res.status(200).json({message: "User is logged out successfully."});
}

export const getMyProfile = async(req,res,next) => {
    const signedUser = req.user;
    let userProfileData;
    try {
        userProfileData = {
            "name": signedUser.name,
            "email": signedUser.email,
            "gender": signedUser.gender,
            "country": signedUser.country,
            "blogs": signedUser.blogs
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Failed to get information of user."});
    }
    return res.status(200).json({userProfileData});
}

export const updateUserProfile = async(req,res,next) => {
    const {name, gender, country} = req.body;
    if(name==null || gender==null || country==null) {
        console.log("One or more field(s) is empty.");
        return res.status(400).json({message: "Fields(s) cannot be empty."});
    }

    const signedUser = req.user;
    if(signedUser==null) {
        console.log("Signed user is null.");
        return res.status(404).json({message: "Failed to update profile due to some internal errors. Please try to login and update again."});
    }

    try {
        await User.findByIdAndUpdate(signedUser.id, {
            name,
            gender,
            country
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Failed to update user profile."});
    }

    let updatedUser;
    try {
        updatedUser = await User.findById(signedUser.id);
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Profile updated successfully. Referesh to view your profile."});
    }

    return res.status(200).json({message: "User profile updated successfully.", updatedProfile: updatedUser});
}