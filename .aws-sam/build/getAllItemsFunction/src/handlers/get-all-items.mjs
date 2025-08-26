import { getCollection } from '../lib/db-connection.mjs';

/**
 * A simple example includes a HTTP get method to get all items from a MongoDB collection.
 */
export const getAllItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    try {
        const collection = await getCollection();
        
        // Get all items from the collection
        const items = await collection.find({}).toArray();
        
        // Convert MongoDB _id to string for JSON serialization
        const formattedItems = items.map(item => ({
            ...item,
            _id: item._id.toString()
        }));

        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify(formattedItems)
        };

        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;
    } catch (err) {
        console.error("Error", err);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to retrieve items',
                message: err.message 
            })
        };
    }
};