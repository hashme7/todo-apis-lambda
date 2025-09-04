const { getCollection } = require('../lib/db-connection.js');

/**
 * A simple example includes a HTTP get method to get all items from a MongoDB collection.
 */
const getAllItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    
    console.info('received:', event);

    try {
        const collection = await getCollection();
        
        const items = await collection.find({}).toArray();
        
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

module.exports = {
    getAllItemsHandler
};