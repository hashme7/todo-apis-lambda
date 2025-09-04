import { getCollection } from "../lib/db-connection.mjs";

const processTodo = async (operation, payload) => {
    const collection = await getCollection('todos');

    switch (operation) {
        case 'CREATE_TODO':
            return await createTodo(collection, payload);

        case 'UPDATE_TODO':
            return await updateTodo(collection, payload);

        case 'DELETE_TODO':
            return await deleteTodo(collection, payload);

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}
export const todoProcessHandler = async(event) => {
     console.info('Processing SQS messages:', JSON.stringify(event, null, 2));

    const results = [];
    
    for (const record of event.Records) {
        try {
            const message = JSON.parse(record.body);
            const { operation, payload, requestId } = message;

            console.log(`Processing ${operation} for requestId: ${requestId}`);

            const result = await processTodo(operation, payload);
            
            results.push({
                requestId,
                operation,
                success: true,
                result
            });

        } catch (error) {
            console.error('Error processing record:', error);
            console.error('Record:', JSON.stringify(record, null, 2));
            
            results.push({
                messageId: record.messageId,
                error: error.message,
                success: false
            });
            
            // Re-throw to trigger SQS retry mechanism
            throw error;
        }
    }

    console.info('Processing complete:', results);
    return { processedCount: results.length, results };
}

async function createTodo(collection, payload) {
    // Additional business logic can go here
    // e.g., validation, data enrichment, etc.
    
    const todo = {
        ...payload,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.updatedAt)
    };

    const result = await collection.insertOne(todo);
    
    // Trigger additional async operations

    return {
        _id: result.insertedId.toString(),
        ...todo
    };
}

async function updateTodo(collection, payload) {
    const { id, updates } = payload;
    
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid todo ID');
    }

    const updateDoc = {
        ...updates,
        updatedAt: new Date(payload.updatedAt)
    };

    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
        throw new Error('Todo not found');
    }

    const updatedTodo = await collection.findOne({ _id: new ObjectId(id) });
    

    return {
        ...updatedTodo,
        _id: updatedTodo._id.toString()
    };
}

async function deleteTodo(collection, payload) {
    const { id } = payload;
    
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid todo ID');
    }

    // Soft delete - mark as deleted instead of removing
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                isDeleted: true, 
                deletedAt: new Date(payload.deletedAt)
            }
        }
    );

    if (result.matchedCount === 0) {
        throw new Error('Todo not found');
    }

    // Trigger additional async operations
    await triggerNotifications('DELETE', { id });
    await updateAnalytics('TODO_DELETED', { id });

    return { id, deleted: true };
}
