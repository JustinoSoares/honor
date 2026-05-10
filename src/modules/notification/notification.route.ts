import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { authentication } from "../../middleware/authorization";

const router = Router();
const controller = new NotificationController();

router.get("/me", authentication, controller.getMyNotifications);
router.get("/:notification_id", authentication, controller.getNotificationById);

export default router;
