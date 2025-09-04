const { getCollection } = require("../lib/db-connection.js");
const { addUser } = require("../api/cognito.js");

const signupFunction = async (event) => {
    if (event.httpMethod !== "POST") {
        throw new Error("this endpoint only accepts POST method")
    }
    console.log('on signup function...')
    const collection = await getCollection("users");
    let body
    try {
        body = JSON.parse(event.body)
    } catch (error) {
        return {
            statusCode: 400, 
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
            },
            body: JSON.stringify({
                error: "Invalid JSON Request",
                message: `errorreee:${error.message}`
            })
        }
    }
    
    const user = {
        ...body,
        createdAt: new Date(),
        isVerified: false,
    }
    
    let insertedUser
    try {
        const result = await collection.insertOne(user);
        await addUser({ username: body.username, email: body.email, password: body.password, name: body.username})
        insertedUser = await collection.findOne({ _id: result.insertedId })
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
            },
            body: JSON.stringify({
                error: "Invalid JSON Request",
                message: `eor: ${error}`
            })
        }
    }
    
    const response = {
        statusCode: 201,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify(insertedUser)
    };
    return response;
};

module.exports = {
    signupFunction
};