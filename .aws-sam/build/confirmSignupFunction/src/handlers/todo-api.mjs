import AWS from "aws-sdk"; // still works, aws-sdk v2 is CJS-compatible
import { v4 as uuidv4 } from 'uuid';


const sqs = new AWS.SQS({ region: "us-east-1" });
const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/643546864364/todoapp-todos";

const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const todoApiHandler = async(event) => {
    console.info('Todo API Request:', JSON.stringify(event, null, 2));
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    try {
        const {httpMethod,pathParameters,body:requestBody} = event;
        let operation,payload;
        let parsedBody = {};
        if (requestBody) {
            try {
                parsedBody = JSON.parse(requestBody);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        error: 'Invalid JSON in request body',
                        message: error.message
                    })
                };
            }
        }
        switch (httpMethod) {
            case 'POST':
                operation = 'CREATE_TODO';
                payload = {
                    id: uuidv4(),
                    title: parsedBody.title,
                    description: parsedBody.description,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    userId: parsedBody.userId || 'anonymous'
                };
                break;

            case 'PUT':
                operation = 'UPDATE_TODO';
                payload = {
                    id: pathParameters.id,
                    updates: parsedBody,
                    updatedAt: new Date().toISOString()
                };
                break;

            case 'DELETE':
                operation = 'DELETE_TODO';
                payload = {
                    id: pathParameters.id,
                    deletedAt: new Date().toISOString()
                };
                break;

            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
        const message = {
            operation,
            payload,
            requestId: event.requestContext.requestId,
            timestamp: new Date().toISOString(),
            source:"api"
        }
        const sqsParams = {
            QueueUrl: SQS_QUEUE_URL,
            MessageBody: JSON.stringify(message),
            MessageAttributes: {
                operation: {
                    DataType: 'String',
                    StringValue: operation
                },
                requestId: {
                    DataType: 'String',
                    StringValue: message.requestId
                }
            }
        };
        await sqs.sendMessage(sqsParams).promise();
        const response = {
            statusCode: operation === 'CREATE_TODO' ? 201 : 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: `Todo operation ${operation.toLowerCase()} queued successfully`,
                requestId: message.requestId,
                ...(operation === 'CREATE_TODO' && { todo: payload })
            })
        };

        console.log('Response:', JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.error('Error in todoApiHandler:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Internal server error',
                message: 'Failed to process todo operation',
                requestId: event.requestContext?.requestId
            })
        };
    }
}