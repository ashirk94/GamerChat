import request from "supertest";
import { createServer } from "http";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "../routes/UserRoutes.js";
import messageRoutes from "../routes/MessageRoutes.js";
import { notFound, errorHandler } from "../middleware/errorMiddleware.js";
import connectDB from "../config/database.js";
import testRoutes from "../routes/TestRoutes.js";

// Mock the database connection
jest.mock("../config/database.js");

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true
	})
);
app.use(cookieParser());

// Logging middleware for debugging
app.use((req, res, next) => {
	console.log(`Received request: ${req.method} ${req.url}`);
	next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/tests", testRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const server = createServer(app);

describe("Basic Route Tests", () => {
	beforeAll(async () => {
		connectDB.mockImplementation(() => Promise.resolve());
		await new Promise((resolve) => server.listen(4001, resolve)); // Start server on port 4001 for testing
	});

	afterAll((done) => {
		server.close(done); // Stop the server after tests
	});

	test("Health check route responds with status UP", async () => {
		const response = await request(server).get("/tests/health");
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ status: "UP" });
	});

	test("Non-existent route returns 404", async () => {
		const response = await request(server).get("/nonexistent");
		expect(response.status).toBe(404);
	});

	test("SQL Injection prevention", async () => {
		const response = await request(server)
			.post("/api/users/login")
			.send({ username: "' OR '1'='1", password: "password" });
		expect(response.status).not.toBe(200);
	});

	test("XSS prevention", async () => {
		const response = await request(server)
			.post("/api/messages")
			.send({ comment: '<script>alert("XSS")</script>' });
		expect(response.status).not.toBe(200);
	});
});
