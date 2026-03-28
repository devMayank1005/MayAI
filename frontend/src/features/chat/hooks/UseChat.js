import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages } from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId }) {
        const trimmedMessage = message?.trim()
        if (!trimmedMessage) {
            return null
        }

        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            const data = await sendMessage({ message: trimmedMessage, chatId })
            const { chat, aiMessage } = data
            const resolvedChatId = chatId || chat?._id

            if (!resolvedChatId) {
                throw new Error("Unable to resolve chat id for this message")
            }

            if (!chatId && chat) {
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
            }

            dispatch(addNewMessage({
                chatId: resolvedChatId,
                content: trimmedMessage,
                role: "user",
            }))
            dispatch(addNewMessage({
                chatId: resolvedChatId,
                content: aiMessage.content,
                role: aiMessage.role,
            }))
            dispatch(setCurrentChatId(resolvedChatId))

            return resolvedChatId
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message || "Failed to send message"))
            return null
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message || "Failed to load chats"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChat(chatId, chats) {
        if (!chatId) {
            return
        }

        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            if ((chats[ chatId ]?.messages?.length || 0) === 0) {
                const data = await getMessages(chatId)
                const { messages } = data

                const formattedMessages = messages.map((msg) => ({
                    content: msg.content,
                    role: msg.role,
                }))

                dispatch(addMessages({
                    chatId,
                    messages: formattedMessages,
                }))
            }
            dispatch(setCurrentChatId(chatId))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message || "Failed to open chat"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    function handleStartNewConversation() {
        dispatch(setCurrentChatId(null))
        dispatch(setError(null))
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleStartNewConversation,
    }

}