import "dotenv/config.js";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server as SocketIoServer } from "socket.io";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDatabase from "./config/database.js";
import userRoutes from "./routes/UserRoutes.js";

connectDatabase();

const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app); // http server

// socket io server
const io = new SocketIoServer(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});

io.on("connection", (socket) => {
	console.log("a user connected");

	socket.on("chat-message", (msg) => {
		console.log("message: " + msg);

		// Emit the received message to all sockets except the sender
		socket.broadcast.emit("chat-message", msg);
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

// Routes
app.use("/api/users", userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Runs the server
const port = process.env.PORT || 4000;
server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
