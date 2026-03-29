import  { Router } from "express";
import { register, verifyEmail, login, getMe, logout, resendVerificationEmail } from "../controller/auth.controller.js";
import { registerValidator, loginValidator, resendVerificationValidator } from "../validator/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
import { resendVerificationRateLimit } from "../middleware/resend-rate-limit.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }
 */
authRouter.post("/login", loginValidator, login)


/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user's details
 * @access Private
 */
authRouter.get('/get-me', authUser, getMe)

/**
 * @route POST /api/auth/logout
 * @desc Logout current user
 * @access Private
 */
authRouter.post('/logout', authUser, logout)



/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get('/verify-email', verifyEmail)

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend verification email
 * @access Public
 * @body { email }
 */
authRouter.post('/resend-verification', resendVerificationValidator, resendVerificationRateLimit, resendVerificationEmail)


export default authRouter;