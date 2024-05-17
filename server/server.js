import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from "socket.io";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { connectDatabase } from "./config/database.js"
import userRoutes from './routes/UserRoutes.js'
import messageRoutes from './routes/UserRoutes.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express(); 
app.use(cors());
const server = createServer(app); // constructor for the http server 
const io = new Server(server); //create socket.io server 
const __dirname = dirname(fileURLToPath(import.meta.url));

const mongoURI = process.env.DB_CONNECTION;


connectDatabase();


const usersSockets = {}

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'chat.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat-message', (msg) => {
    console.log('message: ' + msg);

    // Emit the received message to all sockets except the sender
    socket.broadcast.emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


server.listen(4000, () => {
  console.log('server running at http://localhost:4000');
});

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/messages", messageRoutes);
  
  // Error handling
  app.use(notFound);
  app.use(errorHandler);
  
  // Runs the server
  //server.listen(process.env.PORT || 4000);