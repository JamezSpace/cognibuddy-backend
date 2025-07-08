import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import client from "../db-util";
import { ExtendedRequest } from "../interfaces/ExtendedRequested.interface";


const games: Collection = client.db("cognibuddy").collection("games");

const saveGameProgress = async (req: ExtendedRequest, res: Response) => {
    try {
        const childId = req.user.id;
        const gameName = req.params.game_name;
        const { matches, attempts, score, date_played } = req.body;

        const result = await games.insertOne({
            child_id: new ObjectId(childId),
            game: gameName,
            matches,
            attempts,
            score,
            date_played: new Date(date_played)
        });

        res.status(201).json({ status: 'success', id: result.insertedId });
    } catch (err) {
        console.error('Failed to save game result:', err);
        res.status(500).json({ error: 'Failed to save game result' });
    }
}

const getGameProgress = async (req: ExtendedRequest, res: Response) => {
    try {
        const childId = req.user.id;
        const gameName = req.params.game_name;

        const scores = await games
            .find({ child_id: new ObjectId(childId), game: gameName })
            .sort({ date_played: -1 })
            .toArray();

        res.json({ status: 'success', data: scores });
    } catch (err) {
        console.error('Failed to fetch game history:', err);
        res.status(500).json({ error: 'Failed to fetch game history' });
    }
}

const getAllGameSummary = async (req: ExtendedRequest, res: Response) => {
    try {
        const childId = req.user.id;

        const pipeline = [
            { $match: { child_id: new ObjectId(childId) } },
            {
                $sort: { date_played: -1 } // sort first to get the latest score
            },
            {
                $group: {
                    _id: '$game',
                    recentScore: { $first: '$score' },
                    averageScore: { $avg: '$score' },
                    bestScore: { $max: '$score' },
                    timesPlayed: { $sum: 1 },
                    date_played: { $first: '$date_played' }
                }
            },
            {
                $project: {
                    game: '$_id',
                    recentScore: 1,
                    averageScore: { $round: ['$averageScore', 0] },
                    bestScore: 1,
                    timesPlayed: 1,
                    badges: {
                        $cond: [
                            { $gte: ['$averageScore', 90] },
                            ['🥇 Gold'],
                            {
                                $cond: [
                                    { $gte: ['$averageScore', 75] },
                                    ['🥈 Silver'],
                                    ['🥉 Bronze']
                                ]
                            }
                        ]
                    }
                }
            }
        ];

        const result = await games.aggregate(pipeline).toArray();
        res.json({ status: 'success', data: result });
    } catch (err) {
        console.error('Summary fetch failed:', err);
        res.status(500).json({ status: 'error', message: 'Failed to load summary' });
    }
};



export {
    saveGameProgress,
    getGameProgress,
    getAllGameSummary
}