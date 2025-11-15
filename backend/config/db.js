require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not set in .env');
        }

        // Add sensible timeouts and prefer IPv4 to avoid some DNS/resolution issues on Windows
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            family: 4,
        });

        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:\n', error);
        console.error('\nHelpful checks:');
        console.error('  1) Ensure your IP (or 0.0.0.0/0 for temporary testing) is allowed in MongoDB Atlas Network Access (IP Whitelist).');
        console.error('  2) Verify the username/password and that the user has DB access.');
        console.error('  3) If using an SRV URI (mongodb+srv://) ensure DNS resolution works and do not include a port.');
        console.error('  4) Optionally add a database name and options to the URI, e.g. /taskmanager?retryWrites=true&w=majority');
        process.exit(1);
    }
};

module.exports = connectDB;
