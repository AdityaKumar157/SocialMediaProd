import express from "express";
import { getAllUsers, getMyProfile, login, logoutUser, signup, updateUserProfile } from "../controllers/user-controller";
import { auth } from '../middleware/auth';
import { isUserLoggedOut } from "../middleware/isUserLoggedOut";

const router = express.Router();

router.get("/", getAllUsers);

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", auth, logoutUser);

router.get("/myProfile", auth, getMyProfile);

router.put("/updateProfile", auth, updateUserProfile);

export default router;