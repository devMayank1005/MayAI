import { Server } from "socket.io";


let io;

export function initSocket(httpServer) {
    const SOCKET_ORIGIN = process.env.SOCKET_ORIGIN || "http://localhost:5173";
    
    io = new Server(httpServer, {
        cors: {
            origin: SOCKET_ORIGIN,
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")
    console.log("Socket.io CORS origin:", SOCKET_ORIGIN)

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}