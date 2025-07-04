import express, { Router } from "express";
import { deleteAUser, getAllUsers, postAUser } from "../controllers/users.controller";
import { validatePostBodyRequest } from "../middleware/users.middleware";
import { validateEmptyBody } from "../middleware/util.middleware";

const router = Router();

router.get("/", getAllUsers);
router.post("/", 
    validateEmptyBody,
    validatePostBodyRequest, 
postAUser);
router.delete("/:id", deleteAUser); 

export default router;