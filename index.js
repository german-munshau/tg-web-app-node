const TelegramApi = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')


const token = '5416293431:AAEBc6WmixONzcPtQj5wvpwflZvCKyYK6SA'

const bcAppUrl = 'https://incandescent-salmiakki-46088e.netlify.app'

const bot = new TelegramApi(token, {polling: true})

const app = express()

app.use(express.json)
app.use(cors())

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {

        await bot.sendMessage(chatId, `Необходима авторизация, введите логин, пароль от системы Кларис`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Авторизация', web_app: {url: bcAppUrl + '/login'}, style: {width: 50}}]
                ],
                resize_keyboard: true
            }
        })

        // await bot.sendMessage(chatId, `Необходима авторизация, введите логин, пароль от системы Кларис`, {
        //     reply_markup: {
        //         keyboard: [
        //             [{text: 'Авторизация', web_app: {url: bcAppUrl + '/login'}, style:{width: 50}}]
        //         ],
        //         resize_keyboard: true
        //     }
        // })

        // await bot.sendMessage(chatId, `Заполни форму`, {
        //     reply_markup: {
        //         inline_keyboard: [
        //             // [{text: 'Yandex page inline', web_app: {url: yaUrl}}],
        //             [{text: 'Показать список', web_app: {url: webAppUrl}}]
        //         ]
        //     }
        // })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            // отправка реквизитов для получения токена
            await bot.sendMessage(chatId, 'логин: ' + data?.login)
            await bot.sendMessage(chatId, 'пароль: ' + data?.password)

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Спасибо за обратную связь')
            }, 1000)
        } catch (e) {
            console.log(e)
        }
    }


})


// bot.on('message', async msg => {
//     const chatId = msg.chat.id;
//     const text = msg.text;
//
//     if (text === '/start') {
//         await bot.sendMessage(chatId, `Заполни форму`, {
//             reply_markup: {
//                 keyboard: [
//                     [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
//                 ]
//             }
//         })
//
//         await bot.sendMessage(chatId, `Заполни форму`, {
//             reply_markup: {
//                 inline_keyboard: [
//                     // [{text: 'Yandex page inline', web_app: {url: yaUrl}}],
//                     [{text: 'Показать список', web_app: {url: webAppUrl}}]
//                 ]
//             }
//         })
//     }
//
//     if (msg?.web_app_data?.data) {
//         try {
//             const data = JSON.parse(msg?.web_app_data?.data)
//
//             await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country)
//             await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street)
//
//             setTimeout(async () => {
//                 await bot.sendMessage(chatId, 'Спасибо за обратную связь')
//             }, 3000)
//         } catch (e) {
//             console.log(e)
//         }
//     }
//
//
// })

// app.post('/web-data', async (req, res) => {
//     const {queryId, products, totalPrice} = req.body
//     try {
//         await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Успешная покупка',
//             input_message_content: {
//                 message_text: 'Поздравляю, вы приобрели товар на сумму ' + totalPrice
//             }
//
//         })
//
//         return res.status(200).json({})
//     } catch (e) {
//         await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Не удалось приобрести товар',
//             input_message_content: {
//                 message_text: 'Не удалось приобрести товар'
//             }
//
//         })
//         return res.status(500).json({})
//     }
//
//
// })


app.post('/web-data', async (req, res) => {
    const {queryId, login, password} = req.body

    console.log('queryId, login, password', queryId, login, password)
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Ответ от бота',
            input_message_content: {
                message_text: 'Ответ от бота: ' + login + password
            }

        })
        return res.status(200).json({})

    } catch (e) {

        // await bot.answerWebAppQuery(queryId, {
        //     type: 'article',
        //     id: queryId,
        //     title: 'Не удалось приобрести товар',
        //     input_message_content: {
        //         message_text: 'Не удалось приобрести товар'
        //     }
        //
        // })
        return res.status(500).json({})
    }


})

const PORT = 8000

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT)
})

