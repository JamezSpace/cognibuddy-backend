import client from "../db-util";
import { Collection, ObjectId } from "mongodb";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ExtendedRequest } from "../interfaces/ExtendedRequested.interface";


const users: Collection = client.db("cognibuddy").collection("users");

const getAllUsers = async (req: Request, res: Response) => {
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
    } catch (error) {
        console.error(error);

        res.status(500).json({ error: "Failed to delete user" });
    }
}

const addChild = async (req: ExtendedRequest, res: Response) => {
    try {
        const { name, pin } = req.body;
        const parentId = req.user.id;

        const hashedPin = await bcrypt.hash(pin, 10);

        const newChild = {
            name,
            password: hashedPin,
            role: 'child',
            parent_id: new ObjectId(parentId)
        };

        await users.insertOne(newChild);

        res.status(201).json({ status: "success", message: 'Child added successfully' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to add child" });
    }
}

const getChildren = async (req: ExtendedRequest, res: Response) => {
    try {
        const parentId = req.user.id;

        const children = await users.aggregate([
            {
                $match: {
                    parent_id: new ObjectId(parentId),
                    role: 'child'
                }
            },
            {
                $lookup: {
                    from: 'games',
                    localField: '_id',
                    foreignField: 'child_id',
                    as: 'game_stats'
                }
            },
            {
                $addFields: {
                    games_played: { $size: '$game_stats' },
                    best_score: { $max: '$game_stats.score' },
                    average_score: { $avg: '$game_stats.score' },
                    badges: {
                        $cond: [
                            { $gte: [{ $avg: '$game_stats.score' }, 90] },
                            ['🥇 Gold'],
                            {
                                $cond: [
                                    { $gte: [{ $avg: '$game_stats.score' }, 75] },
                                    ['🥈 Silver'],
                                    ['🥉 Bronze']
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    age: 1,
                    games_played: 1,
                    best_score: 1,
                    average_score: 1,
                    badges: 1
                }
            }
        ]).toArray();


        res.json({ status: 'success', data: children });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch children' });
    }
}

const deleteAChild = async (req: ExtendedRequest, res: Response) => {
    try {
        const parentId = req.user.id;
        const childId = req.params.id;

        if (!ObjectId.isValid(childId)) {
            res.status(400).json({ error: 'Invalid child ID' });
            return
        }

        const result = await users.deleteOne({
            _id: new ObjectId(childId),
            parent_id: new ObjectId(parentId),
            role: 'child'
        });

        if (result.deletedCount === 0) {
            res.status(404).json({ error: 'Child not found or not owned by you' });
            return
        }

        res.status(200).json({ status: 'success', message: 'Child deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export {
    getAllUsers,
    postAUser,
    deleteAUser,
    addChild,
    getChildren,
    deleteAChild
}