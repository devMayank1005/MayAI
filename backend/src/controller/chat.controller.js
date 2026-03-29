import { analyzeImage, generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {

    const { chat: chatId } = req.body;
    const message = req.body?.message || '';
    const useInternetSearch = String(req.body?.useInternetSearch || 'false').toLowerCase() === 'true';
    const uploadedImage = req.file;
    const hasText = Boolean(message.trim());

    if (!hasText && !uploadedImage) {
        return res.status(400).json({
            message: 'Please provide a message or upload an image.',
        });
    }


    let title = null, chat = null;

    if (!chatId) {
        title = await generateChatTitle(hasText ? message : 'Analyze this image');
        chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    const resolvedChatId = chatId || chat._id;
    const imageUrl = uploadedImage
        ? `${req.protocol}://${req.get('host')}/uploads/${uploadedImage.filename}`
        : null;

    const userMessage = await messageModel.create({
        chat: resolvedChatId,
        content: hasText ? message : 'Analyze this image',
        role: "user",
        imageUrl,
        imageMimeType: uploadedImage?.mimetype || null,
        useInternetSearch,
    })

    const messages = await messageModel.find({ chat: resolvedChatId })

    let imageAnalysis = null;
    if (uploadedImage?.path) {
        imageAnalysis = await analyzeImage(uploadedImage.path, uploadedImage.mimetype);
    }

    const aiResult = await generateResponse(messages, {
        useInternetSearch,
        imageContext: imageAnalysis,
    });

    const aiMessage = await messageModel.create({
        chat: resolvedChatId,
        content: aiResult.text,
        role: "ai",
        useInternetSearch,
        sources: aiResult.sources || [],
        imageAnalysis,
    })


    res.status(201).json({
        title,
        chat,
        userMessage,
        aiMessage
    })

}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}