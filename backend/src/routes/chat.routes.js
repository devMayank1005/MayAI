import {Router} from 'express';
import { sendMessage, getChats, getMessages, deleteChat } from '../controller/chat.controller.js';
import { authUser } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';


const chatRouter = Router();

chatRouter.post('/message', authUser, uploadSingleImage, sendMessage);
chatRouter.get('/', authUser, getChats);
chatRouter.get('/:chatId/messages', authUser, getMessages);
chatRouter.delete('/:chatId', authUser, deleteChat);



export default chatRouter;