const AWS = require("aws-sdk");


const sendMessageMock = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({})
});

AWS.SQS = jest.fn(() => ({
    sendMessage: sendMessageMock
}));
const { todoApiHandler } = require("../src/handlers/todo-api")

describe("todo-api", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should return 200 for options method", async () => {
        const event = {
            httpMethod: "OPTIONS",
            headers: {},
        }
        const result = await todoApiHandler(event);
        expect(result.statusCode).toBe(200);
        expect(result.headers['Content-Type']).toBe('application/json');
        expect(result.body).toBe('');
    })
    test("should return 400 for invalid JSON body", async () => {
        const event = {
            httpMethod: "POST",
            body: "invalid json"
        };
        const result = await todoApiHandler(event);
        expect(sendMessageMock).not.toHaveBeenCalled();
        expect(result.statusCode).toBe(400);
        expect(result.headers['Content-Type']).toBe('application/json');
        const body = JSON.parse(result.body);
        expect(body.error).toBe("Invalid JSON in request body");
    });
    test("should handle POST request to create todo", async () => {
        const event = {
            httpMethod: "POST",
            body: JSON.stringify({
                title: "Test Todo",
                description: "Test Description",
                userId: "test-user",
            }),
            requestContext: {
                requestId: "test-request-id"
            }

        };
        const result = await todoApiHandler(event);
        expect(result.statusCode).toBe(201);
        expect(sendMessageMock).toHaveBeenCalled();
        expect(result.headers['Content-Type']).toBe('application/json');
        const body = JSON.parse(result.body);
        console.log("Response Body:", body);
        expect(body.todo.title).toBe("Test Todo");
        expect(body.todo.description).toBe("Test Description");
        expect(body.todo.userId).toBe("test-user");
        expect(body.todo.completed).toBe(false);
    });
    test("should handle PUT request to update todo", async () => {
        const event = {
            httpMethod: "PUT",
            pathParameters: { id: "12345" },
            body: JSON.stringify({
                title: "Updated Todo",
                description: "Updated Description",
            }),
            requestContext: {
                requestId: "test-request-id"
            }
        };

        const result = await todoApiHandler(event);
        expect(sendMessageMock).toHaveBeenCalled();
        expect(result.statusCode).toBe(200);
        expect(result.headers['Content-Type']).toBe('application/json');
    });
    test("should handle DELETE request to delete todo", async () => {
        const event = {
            httpMethod: "DELETE",
            pathParameters: { id: "12345" },
            requestContext: {
                requestId: "test-request-id"
            }
        };

        const result = await todoApiHandler(event);
        expect(sendMessageMock).toHaveBeenCalled();
        expect(result.statusCode).toBe(200);
        expect(result.headers['Content-Type']).toBe('application/json');
    });
})