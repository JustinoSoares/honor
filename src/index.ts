import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { initSocket } from "./config/socket";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./modules/user/user.route";
import eventRoutes from "./modules/event/event.route";
import authRoutes from "./modules/auth/auth.route";
import backofficeRoutes from "./modules/backoffice/routes";
import ticketRoutes from "./modules/ticket/ticket.route";
import notificationRoutes from "./modules/notification/notification.route";
import commentRoutes from "./modules/comment/comment.route";

const app = express();
const httpServer = createServer(app);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(express.json());
initSocket(httpServer);

setupSwagger(app);

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/backoffice", backofficeRoutes);
app.use("/api/v1/ticket", ticketRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/comment", commentRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
