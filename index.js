require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware')

const PORT = process.env.PORT || 8000;
const TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL

global.bot = new TelegramApi(TOKEN, {polling: true})

const app = express()
app.use(express.json())
app.use(cors({origin: '*'}));
app.use('/', router);
app.use(errorHandler);

bot.on('message', async msg => {
    const chat_id = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        const data = await bot.sendMessage(chat_id, `Необходима авторизация, введите логин, пароль от системы Кларис`)
        const message_id = data.message_id
        await bot.editMessageReplyMarkup({
            inline_keyboard: [
                [{text: 'Авторизация', web_app: {url: WEB_APP_URL + '/login?messageId=' + message_id}}]
            ]
        }, {chat_id, message_id})
    }
})

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log('Server started on port ' + PORT)
        })
    } catch (e) {
        console.log(e)
    }
};

start().then();

