jest.resetModules();

jest.mock('../src/lib/db-connection.js', () => {
  const mockCollection = {
    insertOne: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    find: jest.fn()
  };

  return {
    getCollection: jest.fn().mockResolvedValue(mockCollection),
    connectToDatabase: jest.fn().mockResolvedValue({
      client: {},
      db: {
        collection: () => mockCollection
      }
    }),
    __mockCollection: mockCollection
  };
});

const { putItemHandler } = require('../src/handlers/put-item.js');
const dbConnection = require('../src/lib/db-connection.js');

describe("putItem", () => {
  let mockCollection;

  beforeAll(() => {
    mockCollection = dbConnection.__mockCollection;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCollection.insertOne.mockClear();
    mockCollection.findOne.mockClear();
    dbConnection.getCollection.mockResolvedValue(mockCollection);
  });

  test("should insert item and return 201 with formatted item", async () => {
    const mockObjectId = { 
      toString: () => "507f1f77bcf86cd799439011" 
    };
    
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ 
        title: "Test todo",
        description: "Test description"
      })
    };
    const context = {};

    mockCollection.insertOne.mockResolvedValue({ 
      insertedId: mockObjectId 
    });
    
    mockCollection.findOne.mockResolvedValue({ 
      _id: mockObjectId,
      title: "Test todo",
      description: "Test description",
      createdAt: new Date("2023-01-01T00:00:00.000Z"),
      updatedAt: new Date("2023-01-01T00:00:00.000Z"),
      completed: false
    });

    const result = await putItemHandler(event, context);
    expect(result.statusCode).toBe(201);
    expect(result.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(result.body);
    expect(body._id).toBe("507f1f77bcf86cd799439011");
    expect(body.title).toBe("Test todo");
    expect(body.description).toBe("Test description");
    expect(body.completed).toBe(false);
    
    
    expect(dbConnection.getCollection).toHaveBeenCalledWith('todos');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test todo",
        description: "Test description",
        completed: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    );
    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockObjectId });
  });

  test("should return 400 for invalid JSON", async () => {
    const event = {
      httpMethod: "POST",
      body: "invalid json"
    };

    const result = await putItemHandler(event, {});

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe("Invalid JSON Request");
    
    expect(mockCollection.insertOne).not.toHaveBeenCalled();
  });

  test("should throw error for non-POST methods", async () => {
    const event = {
      httpMethod: "GET",
      body: JSON.stringify({ title: "Test todo" })
    };

    await expect(putItemHandler(event, {})).rejects.toThrow(
      "putItem only accepts POST method, you tried: GET"
    );
  });


});