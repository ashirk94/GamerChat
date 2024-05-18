import mongoose from "mongoose";

// Connects to the MongoDB database
async function connectDatabase() {
	try {
		const connectionString = process.env.DB_CONNECTION;

		// Connect to the database
		await mongoose.connect(connectionString);
		// can console.log connection message here
	} catch (error) {
		console.error("MongoDB connection error:", error);
	}
}

// Calls the function to connect to the database
// We only need to call this function once in the entire application
await connectDatabase();

const database = mongoose.connection;

// Exports the connection to the database
export default database;
