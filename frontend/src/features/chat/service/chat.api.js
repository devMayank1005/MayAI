import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const normalizedBase = apiBase.replace(/\/$/, "");

const chatBaseURL = `${normalizedBase}/api/chats`;

const chatApi = axios.create({
  baseURL: chatBaseURL,
  withCredentials: true,
});

export async function getChats() {
  const response = await chatApi.get("/");
  return response.data;
}

export async function getMessages(chatId) {
  const response = await chatApi.get(`/${chatId}/messages`);
  return response.data;
}

export async function deleteChat(chatId) {
  const response = await chatApi.delete(`/${chatId}`);
  return response.data;
}

export async function sendMessage({ message, chat, useInternetSearch, imageFile }) {
  const formData = new FormData();
  formData.append('message', message || '');

  if (chat) {
    formData.append('chat', chat);
  }

  formData.append('useInternetSearch', String(Boolean(useInternetSearch)));

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await chatApi.post('/message', formData);
  return response.data;
}
