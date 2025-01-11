import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import sessionManager from "./managers/sessions/sessionManager.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [`${process.env.REACT_APP_SOCK_IT_URL}:3000`, 'http://localhost:3000'],
        methods: ["GET", "POST"]
    }
});
sessionManager(io);

httpServer.listen(3001, () => {
    console.log("Started listening on port 3001");
});