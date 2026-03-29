import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {

    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { email }, { username } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({ 
        username, 
        email, 
        password,
        verified: process.env.NODE_ENV === 'development' ? true : false
    })

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET)

    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    // Do not block registration on SMTP availability.
    void sendEmail({
        to: email,
        subject: "Welcome to MayAi! Verify Your Email",
        html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>MayAi</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The MayAi Team</p>
        `,
        text: `Hi ${username},\n\nThank you for registering at MayAi.\n\nPlease verify your email by visiting this link:\n${BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}\n\nIf you did not create an account, please ignore this email.\n\nBest regards,\nThe MayAi Team`
    }).then(() => {
        console.log(`Verification email sent to ${email}`);
    }).catch((err) => {
        console.error('Failed to send verification email:', err);
    });

    res.status(201).json({
        message: "User registered successfully. Verification email is being sent.",
        success: true,
        emailDispatchQueued: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {


        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        user.verified = true;

        await user.save();

        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

        const html =
            `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 16px; text-align: center; }
                p { color: #666; line-height: 1.6; text-align: center; }
                a { display: inline-block; margin-top: 24px; padding: 12px 32px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
                a:hover { background-color: #0056b3; }
                .logo { text-align: center; margin-bottom: 24px; font-size: 24px; font-weight: 700; color: #007bff; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">MayAi</div>
                <h1>Email Verified Successfully!</h1>
                <p>Welcome to MayAi! Your email has been verified and your account is ready to use.</p>
                <p>Click the button below to log in and start exploring.</p>
                <center><a href="${FRONTEND_URL}/login">Go to Login</a></center>
            </div>
        </body>
        </html>
    `

        return res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    }
}

/**
 * @desc Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 * @body { email }
 */
export async function resendVerificationEmail(req, res) {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "No account found with this email",
            success: false,
        });
    }

    if (user.verified) {
        return res.status(400).json({
            message: "Email is already verified",
            success: false,
        });
    }

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET);

    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    void sendEmail({
        to: user.email,
        subject: "MayAi - Verify Your Email",
        html: `
                <p>Hi ${user.username},</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not request this email, please ignore this message.</p>
                <p>Best regards,<br>The MayAi Team</p>
        `,
        text: `Hi ${user.username},\n\nPlease verify your email by visiting this link:\n${BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}\n\nIf you did not request this email, please ignore this message.\n\nBest regards,\nThe MayAi Team`
    }).then(() => {
        console.log(`Verification email resent to ${user.email}`);
    }).catch((err) => {
        console.error('Failed to resend verification email:', err);
    });

    return res.status(200).json({
        message: "Verification email resend is being processed.",
        success: true,
        emailDispatchQueued: true,
    });
}

/**
 * @desc Logout user and clear auth cookie
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logout(req, res) {
    res.clearCookie("token");

    res.status(200).json({
        message: "Logged out successfully",
        success: true,
    });
}
