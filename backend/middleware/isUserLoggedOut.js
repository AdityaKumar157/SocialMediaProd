import jwt from "jsonwebtoken";

export const isUserLoggedOut = async(req,res,next) => {
    if(req.cookies["SMP"] == null) {
        console.log("User is logged out.");
        next();
    }
    return res.status(400).json({message: "Please logout current user to do this operation."});
}