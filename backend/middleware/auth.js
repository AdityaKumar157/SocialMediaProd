import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const auth = async(req,res,next) => {
    //console.log(req.cookies); // returns {
    //     SMP: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTE4NTdmZTM2NjQxNzE5YTYyNmY0N2IiLCJpYXQiOjE2OTYyNDk3NzZ9.BOe8StlPIAyYMh9OV6bdH-ATvdEywRc0wsz1ubmTpH0'
    //   }
    //console.log(req.signedCookies); // returns [Object: null prototype] {}
    //console.log(req.cookies.SMP); // returns eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTE4NTdmZTM2NjQxNzE5YTYyNmY0N2IiLCJpYXQiOjE2OTYyNDk3NzZ9.BOe8StlPIAyYMh9OV6bdH-ATvdEywRc0wsz1ubmTpH0
    console.log(req.cookies["SMP"]); //returns eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTE4NTdmZTM2NjQxNzE5YTYyNmY0N2IiLCJpYXQiOjE2OTYyNDk3NzZ9.BOe8StlPIAyYMh9OV6bdH-ATvdEywRc0wsz1ubmTpH0

    const token = req.cookies["SMP"];
    if(token == null) {
        return res.status(403).json({message: "Failed to authorize user. Please login again."});
    }
    
    let signedUserId;
    try {
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY, (error, decodedToken) => {
            if(error) {
                console.log(error);
                return res.status(403).json({message: "Failed to authorize user. Please login again."});
            } else {
                console.log(decodedToken._id);
                signedUserId = decodedToken._id;
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(403).json({message: "Failed to authorize user. Please login again."})
    }

    let signedUser;
    try {
        signedUser = await User.findById(signedUserId);
    } catch (error) {
        return res.status(400).json({message: "No user found."});
        console.log(error);
    }

    if(false == signedUser) {
        return res.status(400).json({message: "No user found."});
    }
    req.user = signedUser;
    next();
}