import express, { Router } from "express";
import { addChild, deleteAChild, deleteAUser, getAllUsers, getChildren, postAUser } from "../controllers/users.controller";
import { authenticateParent, validateAddChildBodyRequest, validatePostBodyRequest } from "../middleware/users.middleware";
import { validateEmptyBody } from "../middleware/util.middleware";

const router = Router();

router.get("/", getAllUsers);
router.get("/children",
    authenticateParent,
    getChildren);
router.post("/",
    validateEmptyBody,
    validatePostBodyRequest,
    postAUser);
router.post('/children',
    authenticateParent,
    validateAddChildBodyRequest,
    addChild)
router.delete("/:id", deleteAUser);
router.delete('/children/:id', 
    authenticateParent,
deleteAChild);

export default router;