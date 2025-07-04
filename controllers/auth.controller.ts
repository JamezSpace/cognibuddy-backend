import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import { Collection, WithId } from 'mongodb';
import client from "../db-util";
import { sign } from "jsonwebtoken";

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
            res.status(401).json({ message: "Email doesn't exist" });
            return;
        }
    } else {
        user = await users.findOne({ name });
        if (!user) {
            res.status(401).json({ message: "Child name doesn't exist" });
            return;
        }
    }

    const passwordMatch = await bcrypt.compare(new String(password).toString(), user.password);
    if (!passwordMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const token = sign(
        { id: user._id.toString(), role: user.role },
        process.env.JSON_WEB_SECRET || '',
        { expiresIn: '1h' }
    );

    res.json({ token });
}

export {
    login, signUp
};
