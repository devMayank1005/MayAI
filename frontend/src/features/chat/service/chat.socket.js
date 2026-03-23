import { io } from "socket.io-client";

export const initializeSocketConnection = (token) => {
    const socket = io("http://localhost:3000", {
        withCredentials: true,
        auth: {
            token: token
        }
    });

    socket.on("connect", () => {
        console.log("Connected to chat server");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from chat server");
    });

    return socket;
};