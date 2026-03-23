import { initializeSocketConnection } from "../service/chat.socket";

export const useChat = (token) => {
    const socket = initializeSocketConnection(token);

    return{
        initializeSocketConnection
    }
};