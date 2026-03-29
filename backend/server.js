import dotenv from 'dotenv';
import app from './src/app.js';
import http from 'http';
import { initSocket } from './src/sockets/server.socket.js';
import connectToDB from './src/config/database.js';
import { verifyMailTransport } from './src/services/mail.service.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);
initSocket(httpServer);

const startServer = async () => {
  try {
    await connectToDB();
    await verifyMailTransport();

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();