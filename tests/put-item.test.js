// Import should match your export - remove destructuring if it's a default export
const putItemHandler = require('../src/handlers/put-item.js').putItemHandler;

const mockGetCollection = jest.fn();
jest.mock("../src/lib/db-connection", () => ({
  getCollection: mockGetCollection   
}));

describe("putItem", () => {
  let mockCollection;

  beforeEach(() => { // Changed from beforeAll to beforeEach for test isolation
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
    };
    
    mockGetCollection.mockResolvedValue(mockCollection);
  });

  test("should insert item and return 201 with formatted item", async () => {
    const fakeId = { toString: () => "123" };
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ title: "Test todo" })
    };
    const context = {};

    // Setup mock returns
    mockCollection.insertOne.mockResolvedValue({ insertedId: fakeId });
    mockCollection.findOne.mockResolvedValue({ _id: fakeId, title: "Test todo" });

    const result = await putItemHandler(event, context);

    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body._id).toBe("123");
    expect(body.title).toBe("Test todo");
    
    // Verify the mocks were called correctly
    expect(mockGetCollection).toHaveBeenCalledWith('todos'); // Adjust collection name as needed
    expect(mockCollection.insertOne).toHaveBeenCalledWith({ title: "Test todo" });
    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: fakeId });
  });
  
});