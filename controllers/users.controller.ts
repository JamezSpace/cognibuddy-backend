import client from "../db-util";
import { Collection, ObjectId } from "mongodb";
import { Request, Response } from "express";


const users: Collection = client.db("cognibuddy").collection("users");

const getAllUsers = async (req: Request , res: Response) => {
    try {
        const userList = await users.find().toArray();
        res.status(200).json(userList);
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

const postAUser = async (req: Request, res: Response) => {
    try {
        const inserted = await users.insertOne(req.body)
        if (inserted.acknowledged)
            res.status(201).json({ status: "successful", inserted: inserted.insertedId });
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ error: "Failed to add user" });
    }
}

const deleteAUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const deleted = await users.deleteOne({ _id: new ObjectId(userId) });
        
        if (deleted.deletedCount === 1) {
            res.status(200).json({ status: "successful", deleted: userId });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    }catch (error) {
        console.error(error);
        
        res.status(500).json({ error: "Failed to delete user" });
    }
}

export {
    getAllUsers,
    postAUser,
    deleteAUser
}