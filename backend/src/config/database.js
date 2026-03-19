import mongoose from 'mongoose';

const connectToDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is missing in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Database connected');
};

export default connectToDB;
