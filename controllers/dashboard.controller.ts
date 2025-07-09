import { Response } from "express";
import { ObjectId } from "mongodb";
import client from "../db-util";
import { ExtendedRequest } from "../interfaces/ExtendedRequested.interface";

const users = client.db("cognibuddy").collection("users");
const games = client.db("cognibuddy").collection("games");

const getActivityLog = async (req: ExtendedRequest, res: Response) => {
  try {
    const parentId = new ObjectId(req.user.id);

    // 1. Get all children of the parent
    const children = await users
      .find({ parent_id: parentId, role: 'child' })
      .project({ _id: 1, name: 1 })
      .toArray();

    const childMap = Object.fromEntries(children.map(c => [c._id.toString(), c.name]));

    const childIds = children.map(c => c._id);

    // 2. Get recent games played by these children
    const activityLogs = await games
      .find({ child_id: { $in: childIds } })
      .sort({ date_played: -1 })
      .limit(50)
      .project({ child_id: 1, game: 1, score: 1, date_played: 1 })
      .toArray();

    const logs = activityLogs.map(log => ({
      child_name: childMap[log.child_id.toString()],
      game: log.game,
      score: log.score,
      date_played: log.date_played,
    }));

    res.json({ status: 'success', data: logs });
  } catch (err) {
    console.error('Failed to get activity log:', err);
    res.status(500).json({ status: 'error', message: 'Could not load activity log' });
  }
};

export { getActivityLog };
