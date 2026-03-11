import express from "express";
import { UserController } from "./user.controller";
import { validate } from "../../middleware/validate";
import * as userSchema from "./user.schema";
const router = express.Router();
const userController = new UserController();

router.post("/create", validate(userSchema.UserSchema), userController.createUser);
router.get("/list", userController.getAllUsers);
router.get("/each/:user_id", userController.getUserById);
router.put("/update/:user_id", validate(userSchema.UserSchema), userController.updateUser);
router.delete("/delete/:user_id", userController.deleteUser);

export default router;