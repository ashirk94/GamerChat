import "dotenv/config.js";
import express from "express";
import cors from "cors";
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
	app.use(express.static(path.join(__dirname, "client", "client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
	});
} else {
	app.get("/", (req, res) => res.send("Server is ready"));
}

const server = createServer(app); // http server

// socket io server
const io = new SocketIoServer(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});

// Store users and their socket IDs
const users = {};

io.on("connection", (socket) => {
	console.log("a user connected");

	socket.on("register", (displayName) => {
		users[displayName] = socket.id;
		console.log(`User registered: ${displayName}`);
	});

	socket.on("chat-message", (msg) => {
		console.log("message: " + JSON.stringify(msg));

		const recipientSocketId = users[msg.recipient];
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("chat-message", msg);
		}

		// Emit the message back to the sender
		socket.emit("chat-message", msg);
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");

		// Remove the user from the users object
		for (const displayName in users) {
			if (users[displayName] === socket.id) {
				delete users[displayName];
				break;
			}
		}
	});
});
// Logging middleware for debugging
app.use((req, res, next) => {
	console.log(`Received request: ${req.method} ${req.url}`);
	next();
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
