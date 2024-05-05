import mongoose from "mongoose";

// Connects to the MongoDB database
async function connectDatabase() {
    try {
      const connectionString = process.env.DB_CONNECTION;

      // Connect to the database
      await mongoose.connect(connectionString);
      
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  };
  
// Calls the function to connect to the database
await connectDatabase();

const database = mongoose.connection;

// Exports the connection to the database
export default database;
