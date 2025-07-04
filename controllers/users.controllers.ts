import client from "../db-util";
import { Collection } from "mongodb";
import { Request, Response } from "express";


const users: Collection = client.db("cognibuddy").collection("users");

const getAllUsers = async (req: Request , res: Response) => {
    try {
        const userList = await users.find().toArray();
        res.status(200).json(userList);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

const postAUser = async (req: Request, res: Response) => {
    try {
        const inserted = await users.insertOne(req.body)
        if (inserted.acknowledged)
            res.status(201).json({ status: "successful", inserted: inserted.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to add user" });
    }
}

export {
    getAllUsers,
    postAUser
}