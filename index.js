require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const fs = require('fs');

const PORT = process.env.PORT || 8000;
const TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL
const CLARIS_API_URL = process.env.CLARIS_API_URL

const bot = new TelegramApi(TOKEN, {polling: true})


const app = express()
app.use(express.json())
app.use(cors({origin: '*'}));

app.get('/', async (req, res) => {
    return res.send('Server is working...')
})

let chatId = ''

bot.on('message', async msg => {
    chatId = msg.chat.id;
    const text = msg.text;

    //  https://api.telegram.org/bot5416293431:AAETAbHErxrPHS0kx_aACws_zJS9QqbKnpQ/sendMessage?chat_id=311462440&text=Уведомление о документе №123456&reply_markup={"inline_keyboard":[[{"text":"Открыть","web_app":{"url":"https://incandescent-salmiakki-46088e.netlify.app/show/123456"}}]],"resize_keyboard":true}

    //@getmyid_bot
    // Your user ID: 311462440
    // Current chat ID: 311462440

    //masha
    //1583946214


    if (text === '/start') {
        await bot.sendMessage(chatId, `Необходима авторизация, введите логин, пароль от системы Кларис`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Авторизация', web_app: {url: WEB_APP_URL + '/login'}, style: {width: 50}}]
                ],
                resize_keyboard: true
            }
        })
    }

    // ответ для кнопки keyboard
    // if (msg?.web_app_data?.data) {
    //     try {
    //         const data = JSON.parse(msg?.web_app_data?.data)
    //
    //         // отправка реквизитов для получения токена
    //         await bot.sendMessage(chatId, 'логин: ' + data?.login)
    //         await bot.sendMessage(chatId, 'пароль: ' + data?.password)
    //
    //         setTimeout(async () => {
    //             await bot.sendMessage(chatId, 'Спасибо за обратную связь')
    //         }, 1000)
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }
})

const getMessageText = (message) => {
    if (message?.error === 'invalid_grant') {
        return 'Введен неправильный логин или пароль'
    } else if (message?.access_token) {
        return `Вы авторизованы, ${message.user_name}`
    }
    return 'Ошибка сервера'
}

const getOptions = () => {
    const dbData = JSON.parse(fs.readFileSync('db.json', {encoding: 'utf8'}))
    const token = dbData[chatId]
    return {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        },
    }
}

const postOptions = (data) => {
    console.log('data', data)
    const dbData = JSON.parse(fs.readFileSync('db.json', {encoding: 'utf8'}))
    const token = dbData[chatId]
    return {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        },
        body: JSON.stringify(data)
    }
}

// авторизация
app.post('/auth', async (req, res) => {
    const {queryId, login, password} = req.body

    // получение токена
    fetch(CLARIS_API_URL + '/Token', {
        method: "POST",
        body: `grant_type=password&username=${login}&password=${password}`,
        headers: {"Content-Type": "application/x-www-form-urlencoded",},
    })
        .then((response) => response.json())
        .then(async (data) => {

            // запись токена в файл
            const dbData = JSON.parse(fs.readFileSync('db.json', {encoding: 'utf8'}))
            dbData[chatId] = data?.access_token
            fs.writeFileSync('db.json', JSON.stringify(dbData, null, 2), {encoding: "utf8", flag: 'w',});

            // ответ на бота
            try {
                await bot.answerWebAppQuery(queryId, {
                    type: 'article',
                    id: queryId,
                    title: 'Ответ от бота',
                    input_message_content: {
                        message_text: getMessageText(data),
                    }
                })
                return res.status(200).json({})
            } catch (e) {
                return res.status(500).json({})
            }
        })
        .catch(async (error) => {
            console.error(error)
        });
})

// получение документа
app.get('/document/:id', async (req, res) => {
    const url = CLARIS_API_URL + '/vNext/v1/documents/' + req.params["id"]
    const response = await fetch(url, getOptions())
    if (response.ok) {
        const data = await response.json()
        // console.log('document', data)
        return res.status(200).json(data)
    } else if (response.status === 401) {
        console.log(response.status)
        return res.status(response.status).json({})
    }
})

//получение истории согласования
app.get('/agreementHistory/:id', async (req, res) => {
    const url = `${CLARIS_API_URL}/vNext/v1/agreementHistories?orderBy=date+desc,&filters=NoEmptyAgreed&filterBy=document.id="${req.params["id"]}"`
    const response = await fetch(url, getOptions())
    if (response.ok) {
        const data = await response.json()
        // console.log('details', data)
        return res.status(200).json(data)
    } else if (response.status === 401) {
        console.log(response.status)
        return res.status(response.status).json({})
    }
})

//получение позиций в документе
app.get('/documentPositions/:id', async (req, res) => {
    const url = `${CLARIS_API_URL}/vNext/v1/documentPositions?filterBy=document.id="${req.params["id"]}"`

    const response = await fetch(url, getOptions())
    if (response.ok) {
        const data = await response.json()
        console.log('positions', data)
        return res.status(200).json(data)
    } else if (response.status === 401) {
        console.log(response.status)
        return res.status(response.status).json({})
    }
})

// Согласовать документ
app.post('/document/:id/agree', async (req, res) => {

    const {comment} = req.body
    const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/agree`

    try {
        const response = await fetch(url, postOptions({comment}))
        if (response.ok) {
            console.log('OK!')
            return res.status(200).json({})
        } else {
            console.log('ERROR: ' + response.status)
            return res.status(response.status).json({})
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({})
    }


})

// Отклонить документ
app.post('/document/:id/disagree', async (req, res) => {
    const {comment} = req.body
    const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/disagree`

    try {
        const response = await fetch(url, postOptions({comment}))
        if (response.ok) {
            console.log('OK!')
            return res.status(200).json({})
        } else {
            console.log('ERROR: ' + response.status)
            return res.status(response.status).json({})
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({})
    }

})

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT)
})

