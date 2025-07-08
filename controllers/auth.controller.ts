import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import { Collection, ObjectId } from 'mongodb';
import client from "../db-util";
import { sign, verify } from "jsonwebtoken";

const users: Collection = client.db("cognibuddy").collection("users");

const signUp = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
    const { name, email, password, role } = req.body;

    if (role !== 'child') {
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'Email already exists' });
            return
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
        name,
        email,
        password: hashedPassword,
        role
    });

    res.status(201).json({ message: 'User created', userId: result.insertedId });
}

// 68677e6a73e33999bb46dc0d
const login = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
    const { name, email, password, role } = req.body;
    let user: any;

    if (role !== 'child') {
        user = await users.findOne({ email });
        if (!user) {
            res.status(404).json({ valid: false, message: "Email doesn't exist" });
            return;
        }
    } else {
        user = await users.findOne({ name });
        if (!user) {
            res.status(404).json({ valid: false, message: "Child name doesn't exist" });
            return;
        }
    }

    const passwordMatch = await bcrypt.compare(new String(password).toString(), user.password);
    if (!passwordMatch) {
        res.status(401).json({ valid: false, message: 'Invalid credentials' });
        return;
    }

    const accessToken = sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_WEB_SECRET || '',
        { expiresIn: '15m' }
    ),
        refreshToken = sign(
            { id: user._id.toString() }, process.env.JWT_WEB_SECRET || '', { expiresIn: '7d' }
        );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken, id: user._id.toString(), name: user.name });
}

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

export {
    login, signUp, refreshToken
};
