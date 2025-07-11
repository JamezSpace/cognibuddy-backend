import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import client from "../db-util";
import { ExtendedRequest } from "../interfaces/ExtendedRequested.interface";

const users: Collection = client.db("cognibuddy").collection("users");
const games: Collection = client.db("cognibuddy").collection("games");
const gameLimits = client.db("cognibuddy").collection("game_limits");

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

const getChildrenProgressSummary = async (req: ExtendedRequest, res: Response) => {
    try {
        const parentId = new ObjectId(req.user.id);

        // Fetch all children of this parent
        const children = await users
            .find({ parent_id: parentId, role: 'child' })
            .project({ name: 1 })
            .toArray();

        const childSummaries = await Promise.all(
            children.map(async child => {
                const gameSummary = await games
                    .aggregate([
                        { $match: { child_id: child._id } },
                        {
                            $group: {
                                _id: '$game',
                                avgScore: { $avg: '$score' },
                                lastScore: { $first: '$score' },
                                lastPlayed: { $first: '$date_played' }
                            }
                        },
                        {
                            $project: {
                                game: '$_id',
                                avgScore: { $round: ['$avgScore', 0] },
                                lastScore: 1,
                                lastPlayed: 1,
                                badges: {
                                    $cond: [
                                        { $gte: ['$avgScore', 90] },
                                        ['🥇 Gold'],
                                        {
                                            $cond: [
                                                { $gte: ['$avgScore', 75] },
                                                ['🥈 Silver'],
                                                ['🥉 Bronze']
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ])
                    .toArray();

                return {
                    child_id: child._id,
                    name: child.name,
                    progress: gameSummary
                };
            })
        );

        res.json({ status: 'success', data: childSummaries });
    } catch (err) {
        console.error('Failed to get children progress:', err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch progress summary' });
    }
};


const getAllGameLimits = async (req: ExtendedRequest, res: Response) => {
    try {
        const result = await gameLimits.find().toArray();
        res.json({ status: 'success', data: result });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch all limits' });
    }
};


const getGameLimit = async (req: ExtendedRequest, res: Response) => {
    try {
        const childId = req.params.child_id;
        console.log(childId);

        let result;
        if (!childId) result = await gameLimits.find().toArray()
        else result = await gameLimits.findOne({ child_id: new ObjectId(childId) });

        res.json({ status: 'success', data: result || {} });
    } catch (err) {
        console.error('Failed to fetch game limits:', err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch limits' });
    }
};

const setGameLimit = async (req: ExtendedRequest, res: Response) => {
    try {
        const { child_id, restricted_games, session_limit } = req.body;

        await gameLimits.updateOne(
            { child_id: new ObjectId(child_id) },
            {
                $set: {
                    restricted_games,
                    session_limit: session_limit || null
                }
            },
            { upsert: true }
        );

        res.json({ status: 'success' });
    } catch (err) {
        console.error('Failed to set game limits:', err);
        res.status(500).json({ status: 'error', message: 'Failed to update game limits' });
    }
};

const getTodayCount = async (req: ExtendedRequest, res: Response) => {
    const { game_name } = req.params;
    const childId = req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await games.countDocuments({
        child_id: new ObjectId(childId),
        game: game_name,
        date_played: { $gte: startOfDay }
    });

    res.json({ status: 'success', count });
}

export {
    saveGameProgress,
    getGameProgress,
    getAllGameSummary,
    getAllGameLimits,
    getChildrenProgressSummary,
    getGameLimit,
    setGameLimit,
    getTodayCount
}