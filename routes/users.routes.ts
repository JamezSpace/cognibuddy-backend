import express, { Router } from "express";
import { getAllUsers, postAUser } from "../controllers/users.controllers";

const router = Router();

router.get("/", getAllUsers);
router.post("/", postAUser);

export default router;