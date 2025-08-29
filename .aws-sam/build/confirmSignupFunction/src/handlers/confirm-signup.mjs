import { verifyUser } from "../api/cognito.mjs";
import { getCollection } from "../lib/db-connection.mjs";

export const confirmSignupFunction = async (event) => {
    if (event.httpMethod !== "POST") {
        throw new Error('only POST method allowed for this function');
    }
    const collection = await getCollection("users");
    let body;
    try {
        body = JSON.parse(event.body);
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
    try {
        await verifyUser({ username: body.username, confirmationCode: body.confirmationCode })
        await collection.updateOne(
            { email: body.username },
            { $set: { isVerified: true } }
        );
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            }
        };
        return response
    } catch (error) {
        return { statusCode: error.code, body: JSON.stringify({ error: error.message }) };
    }
}