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
    const { name, email, password } = req.body;
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
        token = jwt.sign({_id: existingUser.email.toString()}, process.env.SECRET_KEY);
        //existingUser.tokens.push(token);
        existingUser.tokens = existingUser.tokens.concat({token: token});
        await existingUser.save();
        res.cookie("SMP", token, {
            expires: new Date(Date.now() + 6000000),
            httpOnly: true,
            secure: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({messgae: "Failed to login due to internal errors. Please try again."});
    }

    return res.status(200).json({message: "Login successfull!!"});
}