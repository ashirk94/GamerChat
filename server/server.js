import express from "express";
import cors from "cors";
import { createServer } from "node:http";

// Using .env for environment variables only on a development server
if (process.env.NODE_ENV !== "production") {
    (async () => {
      const dotenv = await import("dotenv");
      dotenv.config();
    })();
  }

// Express app setup and HTTP server
const app = express();
const server = createServer(app);

// Cross-Origin Resource Sharing
app.use(cors());

// Runs the server
server.listen(process.env.PORT || 3000);
