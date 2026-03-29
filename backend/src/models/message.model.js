import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        content: {
            type: String,
            required: true,
            default: '',
        },
        role: {
            type: String,
            enum: [ 'user', 'ai' ],
            required: true,
        },
        imageUrl: {
            type: String,
            default: null,
        },
        imageMimeType: {
            type: String,
            default: null,
        },
        useInternetSearch: {
            type: Boolean,
            default: false,
        },
        sources: {
            type: [
                {
                    title: { type: String, default: '' },
                    url: { type: String, default: '' },
                    snippet: { type: String, default: '' },
                }
            ],
            default: [],
        },
        imageAnalysis: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;