import mongoose from 'mongoose';

jest.setTimeout(30000); // Increase timeout for Jest tests

beforeEach(async () => {
    jest.clearAllMocks(); // Clear mocks between tests
    // Optionally clean all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    try {
        // await mongoose.connection.dropDatabase(); // Drop database after all tests
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error closing the database:', error);
    }
});
