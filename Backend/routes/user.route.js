import { Router } from "express";
import { loginHandler, registerUser } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginHandler);

//secureRoute

export default router;
