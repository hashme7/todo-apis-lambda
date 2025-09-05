const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const connectionString = process.env.MONGO_CONNECTION_STRING;
    const databaseName = process.env.DATABASE_NAME || '';

    if (!connectionString) {
        throw new Error('MONGO_CONNECTION_STRING environment variable is not set');
    }

    const client = new MongoClient(connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });

    try {
        await client.connect();
        const db = client.db(databaseName);
        
        cachedClient = client;
        cachedDb = db;
        
        console.log('Connected to MongoDB');
        return { client, db };
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

async function getCollection(collectionName) {
    const { db } = await connectToDatabase();
    return db.collection(collectionName || process.env.COLLECTION_NAME);
}

module.exports = {
    connectToDatabase,
    getCollection
};