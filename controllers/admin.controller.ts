// controllers/adminController.ts
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import client from '../db-util';

const users = client.db('cognibuddy').collection('users');

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search?.toString().trim() || '';
    const role = req.query.role?.toString();

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const usersList = await users
      .find(query, { projection: { password: 0 } })
      .sort({ name: 1 })
      .toArray();

    res.json({ status: 'success', data: usersList });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ status: 'error', message: 'Failed to load users' });
  }
};


export { getAllUsers };
