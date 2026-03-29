import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { searchInternet } from "./internet.service.js";
import fs from 'fs';

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
    
});

function normalizeSources(rawSearchResult) {
    if (!rawSearchResult) {
        return [];
    }

    let parsed = rawSearchResult;
    if (typeof rawSearchResult === 'string') {
        try {
            parsed = JSON.parse(rawSearchResult);
        } catch (_error) {
            return [];
        }
    }

    const results = parsed?.results || [];
    return results.map((item) => ({
        title: item?.title || '',
        url: item?.url || '',
        snippet: item?.content || item?.snippet || '',
    }));
}

export async function analyzeImage(filePath, mimeType, prompt = 'Describe this image in detail.') {
    const imageBuffer = await fs.promises.readFile(filePath);
    const imageBase64 = imageBuffer.toString('base64');

    const response = await geminiModel.invoke([
        new HumanMessage({
            content: [
                { type: 'text', text: prompt },
                {
                    type: 'media',
                    mimeType,
                    data: imageBase64,
                },
            ],
        }),
    ]);

    return response.text;
}

export async function generateResponse(messages, options = {}) {
    const {
        useInternetSearch = false,
        imageContext = null,
    } = options;

    const modelMessages = messages.map((msg) => {
        if (msg.role === "user") {
            return new HumanMessage(msg.content)
        }
        if (msg.role === "ai") {
            return new AIMessage(msg.content)
        }
        return null
    }).filter(Boolean)

    if (imageContext) {
        modelMessages.push(
            new HumanMessage(`Image analysis context from user's uploaded image: ${imageContext}`)
        )
    }

    const latestUserMessage = [ ...messages ]
        .reverse()
        .find((msg) => msg.role === 'user' && msg.content?.trim())?.content || '';

    let sources = [];
    let searchContextText = '';

    if (useInternetSearch && latestUserMessage) {
        try {
            const rawSearchResult = await searchInternet({ query: latestUserMessage });
            sources = normalizeSources(rawSearchResult);

            searchContextText = sources.length > 0
                ? sources
                    .slice(0, 5)
                    .map((source, index) => {
                        return `${index + 1}. Title: ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet}`;
                    })
                    .join('\n\n')
                : 'No relevant web results were returned.';
        } catch (_error) {
            sources = [];
            searchContextText = 'Web search failed for this request. Be explicit that live sources were unavailable.';
        }
    }

    const response = await mistralModel.invoke([
        new SystemMessage(useInternetSearch
            ? `
            You are a helpful and precise assistant.
            Web search is ENABLED for this user message and fresh results are provided as WEB_RESULTS context.
            Use WEB_RESULTS as primary evidence for recent/current events.
            If WEB_RESULTS are empty or insufficient, clearly say that up-to-date evidence is limited.
        `
            : `
            You are a helpful and precise assistant.
            Web search is DISABLED for this user message.
            Answer from conversation context and your existing knowledge only.
        `),
        ...modelMessages,
        ...(useInternetSearch
            ? [ new HumanMessage(`WEB_RESULTS:\n${searchContextText}`) ]
            : []),
    ]);

    const finalText = response.text;

    return {
        text: finalText,
        sources,
    };

}

export async function generateChatTitle(message) {

    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    return response.text;

}
