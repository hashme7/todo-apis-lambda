const { getCollection ,connectToDatabase} = require("../lib/db-connection.js");

const putItemHandler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        throw new Error(`putItem only accepts POST method, you tried: ${event.httpMethod}`)
    }

    console.info('received:', event);
    console.log('context', context)

    const collection = await getCollection('todos',connectToDatabase);
    let item;
    try {
        item = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
            },
            body: JSON.stringify({
                error: "Invalid JSON Request",
                message: error.message
            })
        }
    }
    
    const todoItem = {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: item.completed || false
    }
    
    let result;
    let insertedItem;
    try {
        result = await collection.insertOne(todoItem);
        insertedItem = await collection.findOne({ _id: result.insertedId });
    } catch (error) {
        console.log("error", error)
    }

    const formattedItem = {
        ...insertedItem,
        _id: insertedItem._id.toString()
    };

    const response = {
        statusCode: 201,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify(formattedItem)
    };
    return response;
};

module.exports = {
    putItemHandler
};