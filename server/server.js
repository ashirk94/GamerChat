import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import "dotenv/config.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/UserRoutes.js";
import messageRoutes from "./routes/MessageRoutes.js";


// Express app setup and HTTP server
const app = express();
const server = createServer(app);

// Cross-Origin Resource Sharing
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Runs the server
server.listen(process.env.PORT || 4000);
