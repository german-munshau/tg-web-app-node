require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const router = require('./routes/index');

const PORT = process.env.PORT || 8000;
const TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL

global.bot = new TelegramApi(TOKEN, {polling: true})

const app = express()
app.use(express.json())
app.use(cors({origin: '*'}));

app.use('/', router);

// chatId, 311462440


bot.setMyCommands([
    {command: '/start', description: 'Старт бота'},
    {command: '/search', description: 'Поиск документа'}
])

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, `Необходима авторизация, введите логин, пароль от системы Кларис`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Авторизация', web_app: {url: WEB_APP_URL + '/login'}, style: {width: 50}},
                        {text: 'Введите номер документа', web_app: {url: WEB_APP_URL + '/search'}}
                    ]
                ],
                resize_keyboard: true
            }
        })
    }

    // if (text === '/search') {
    //     await bot.sendMessage(chatId, 'Введите номер документа', {
    //         reply_markup: {
    //             inline_keyboard: [
    //                 [{text: 'Введите номер документа', web_app: {url: WEB_APP_URL + '/search'}}]
    //             ],
    //             resize_keyboard: true
    //         }
    //     })
    // }
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

