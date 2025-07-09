import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import { Collection, ObjectId } from 'mongodb';
import client from "../db-util";
import { sign, verify } from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/mailer.util";

const users: Collection = client.db("cognibuddy").collection("users");

const signUp = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password, role } = req.body;

    try {
        if (role !== 'child') {
            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // generate a unique token for email verification
        const emailToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        const result = await users.insertOne({
            name,
            email,
            password: hashedPassword,
            role,
            verified: false,
            emailToken,
            emailTokenExpires: verificationExpires
        });

        const verificationLink = `${process.env.CORS_ORIGIN}/verify-email?token=${emailToken}`;
        await sendVerificationEmail(email, name, verificationLink);

        return res.status(201).json({
            message: 'Signup successful. Please check your email to verify your account.',
            userId: result.insertedId
        });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password, role, parent_id } = req.body;
    let user: any;

    if (role !== 'child') {
        user = await users.findOne({ email });
        if (!user) {
            res.status(404).json({ valid: false, message: 'Username not found' });
            return
        }
    } else {
        user = await users.findOne({ username: name, role: 'child' });

        if (!user) {
            res.status(404).json({ valid: false, message: 'Username not found' });
            return
        }
    }

    const passwordMatch = await bcrypt.compare(password.toString(), user.password);
    if (!passwordMatch) {
        res.status(401).json({ valid: false, message: 'Invalid credentials' });
        return
    }

    if (!user.verified) {
        res.status(403).json({ message: 'Email not verified. Please confirm your email.' });
        return
    }

    const accessToken = sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_WEB_SECRET || '',
        { expiresIn: '15m' }
    );

    const refreshToken = sign(
        { id: user._id.toString() },
        process.env.JWT_WEB_SECRET || '',
        { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken, id: user._id.toString(), name: user.name });
};


const refreshToken = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401).json({ message: 'No refresh token provided' });
        return
    }

    try {
        const payload: any = verify(refreshToken, process.env.JWT_WEB_SECRET || '');

        const user = await users.findOne({ _id: new ObjectId(payload.id) });
        if (!user) {
            res.sendStatus(403).json({ message: 'User not found' });
            return;
        }

        const newAccessToken = sign(
            { id: payload.id, role: payload.role },
            process.env.JWT_WEB_SECRET || '',
            { expiresIn: '15m' }
        );

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
}

const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        res.status(400).json({ message: 'Verification token is required.' });
        return
    }

    try {
        const user = await users.findOne({ emailToken: token });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token.' });
            return
        }

        if (user.verified) {
            res.status(200).json({ message: 'Email already verified.' });
            return
        }

        if (new Date() > new Date(user.emailTokenExpires)) {
            res.status(400).json({ message: 'Verification token has expired.' });
            return
        }

        await users.updateOne(
            { _id: new ObjectId(user._id) },
            {
                $set: { verified: true },
                $unset: { emailToken: "", emailTokenExpires: "" }
            }
        );

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

export {
    login, signUp, refreshToken, verifyEmail
};
