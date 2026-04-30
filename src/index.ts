import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSwagger } from './config/swagger';
import userRoutes from './modules/user/user.route';
import eventRoutes from './modules/event/event.route';
import authRoutes from './modules/auth/auth.route';
import backofficeRoutes from './modules/backoffice/routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

setupSwagger(app);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/backoffice', backofficeRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
