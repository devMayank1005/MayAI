import dotenv from 'dotenv';
import app from './src/app.js';
import connectToDB from './src/config/database.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectToDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();