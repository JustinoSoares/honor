import express from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { prisma } from "../../database/prisma";

const router = express.Router();
const userService = new UserService(prisma);
const userController = new UserController(userService);

router.post("/create", userController.createUser);
router.get("/list", userController.getAllUsers);
router.get("/each/:user_id", userController.getUserById);
router.put("/update/:user_id", userController.updateUser);
router.delete("/delete/:user_id", userController.deleteUser);

export default router;