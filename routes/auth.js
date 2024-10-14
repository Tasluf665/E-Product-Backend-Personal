const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const { User, validateUserSignUp, validateUserLogin, validateForgotPassword, validateResetPassword } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../utils/SendEmail");

router.post(
    "/login",
    asyncMiddleware(async (req, res) => {
        const { error } = validateUserLogin(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send({ error: "Invalide email or password" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPassword)
            return res.status(400).send({ error: "Invalide email or password" });

        // if (!user.verified) {
        //     sendVerificationEmail(user.email, user._id);
        //     return res.status(400).send({
        //         error:
        //             "Email is not verified. Please check your email to verify your account",
        //     });
        // }

        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        res.send({
            success: "Login Successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
                refreshToken: refreshToken,
            },
        });
    })
);

router.post("/signup", async (req, res) => {
    const { error } = validateUserSignUp(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send({ error: "User already registered" });

    user = new User(
        _.pick(req.body, ["name", "email", "password"])
    );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    // sendVerificationEmail(user.email, user._id);

    res.send({
        // success: "Please check your email to verify your accont",
        success: "Your account has been created",
    });
});

router.get(
    "/authentication/:token",
    asyncMiddleware(async (req, res) => {
        const { token } = req.params;
        if (!token)
            return res
                .status(401)
                .send({ error: "Access denied. No token provided" });
        try {
            const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
            const user = await User.findById(decoded._id);
            user.verified = true;
            user.save();
            res.send({
                success: "Email verified successfully",
            });
        } catch (ex) {
            res.status(400).send({ error: "Invalide token" });
        }
    })
);

router.post(
    "/forgot-password",
    asyncMiddleware(async (req, res) => {
        const { error } = validateForgotPassword(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (!user)
            return res
                .status(400)
                .send({ error: "User not found with this given email" });

        sendResetPasswordEmail(user.email, user._id);

        res.send({ success: "Check your email to reset your password" });
    })
);

router.get(
    "/reset-password/:token",
    asyncMiddleware(async (req, res) => {
        const { token } = req.params;

        if (!token)
            return res
                .status(401)
                .send({ error: "Access denied. No token provided" });

        try {
            jwt.verify(token, process.env.JWT_PRIVATE_KEY);

            let BackEndURL = process.env.BASE_URL;
            res.render("ResetPasswordForm", { token: token, BackEndURL: BackEndURL });
        } catch (ex) {
            res.status(400).send({ error: "Invalid token" });
        }
    })
);

router.post(
    "/reset-password/:token",
    asyncMiddleware(async (req, res) => {
        const { error } = validateResetPassword(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const { token } = req.params;

        if (!token)
            return res
                .status(401)
                .send({ error: "Access denied. No token provided" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

            const user = await User.findById(decoded._id);

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);

            user.verified = true;
            await user.save();

            res.render("PasswordResetVerification");
        } catch (ex) {
            res.status(400).send({ error: "Invalid token" });
        }
    })
);

module.exports = router;