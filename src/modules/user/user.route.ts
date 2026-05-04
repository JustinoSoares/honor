import express from "express";
const router = express.Router();
import { UserController } from "./user.controller";
import { validate } from "../../middleware/validate";
import * as userSchema from "./user.schema";
const userController = new UserController();

router.post("/create", validate(userSchema.UserSchema), userController.createUser);
router.get("/list", userController.getAllUsers);
router.get("/each/:user_id", userController.getUserById);
router.put("/update/:user_id", validate(userSchema.UserUpdateSchema), userController.updateUser);
router.delete("/delete/:user_id", userController.deleteUser);

export default router;
