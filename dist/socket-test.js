"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTQ0ODk2YzBlMmVlM2NkNTA2OTdjY2IiLCJpYXQiOjE3NjYxNTk3OTQsImV4cCI6MTc2NjI0NjE5NH0.LKU8ctal4vDSQV1JZvs31mJ9DGyFf_oOZZ-Kt_27ung"
    }
});
socket.on("connect", () => {
    console.log("Connected:", socket.id);
    const conversationId = "694531ca9a2130396eac4fef";
    socket.emit("join-conversation", conversationId);
    setTimeout(() => {
        socket.emit("send-message", {
            conversationId,
            text: "Hello from real-time Socket.IO"
        });
    }, 1000);
});
socket.on("user-online", (userId) => {
    console.log("🟢 User online:", userId);
});
socket.on("user-offline", (userId) => {
    console.log("🔴 User offline:", userId);
});
socket.on("new-message", (message) => {
    console.log("New message received:", message);
});
