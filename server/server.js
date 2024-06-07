import "dotenv/config.js";
import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server as SocketIoServer } from "socket.io";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDatabase from "./config/database.js";
import userRoutes from "./routes/UserRoutes.js";
import messageRoutes from "./routes/MessageRoutes.js";

connectDatabase();

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://gamer-chat-161acd6cf748.herokuapp.com/"
		],
		credentials: true
	})
);
app.use(cookieParser());

if (process.env.NODE_ENV === "production") {
	const __dirname = path.resolve();
	// Serves static files from the "client/dist" directory
	app.use(express.static(path.join(__dirname, "client", "dist")));

	// Handles React routing, return all requests to React app
	app.get("*", (req, res, next) => {
		if (req.originalUrl.startsWith("/api")) {
			// Lets API requests be handled by other routes
			next();
		} else {
			res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
		}
	});
}

const server = createServer(app); // http server

// socket io server
const io = new SocketIoServer(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://gamer-chat-161acd6cf748.herokuapp.com/"
		],
		methods: ["GET", "POST"]
	}
});

// Store users and their socket IDs
const users = {};

io.on("connection", (socket) => {
	socket.on("register", (displayName) => {
		users[displayName] = socket.id;
	});

	socket.on("chat-message", (msg) => {
		const recipientSocketId = users[msg.recipient];
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("chat-message", msg);
		}

		// Emit the message back to the sender
		socket.emit("chat-message", msg);
	});

	socket.on("disconnect", () => {
		// Remove the user from the users object
		for (const displayName in users) {
			if (users[displayName] === socket.id) {
				delete users[displayName];
				break;
			}
		}
	});
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Runs the server
const port = process.env.PORT || 4000;
server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
