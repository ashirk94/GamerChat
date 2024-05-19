import mongoose from "mongoose";

// Connects to the MongoDB database
async function connectDatabase() {
	try {
		const connectionString = process.env.DB_CONNECTION;

		// Connect to the database
		await mongoose.connect(connectionString);
		console.log("MongoDB connection established");
	} catch (error) {
		console.error("MongoDB connection error:", error);
	}
}

export default connectDatabase;
