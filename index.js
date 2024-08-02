const TelegramApi = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const fs = require('fs');

const token = '5416293431:AAETAbHErxrPHS0kx_aACws_zJS9QqbKnpQ'
const webAppUrl = 'https://incandescent-salmiakki-46088e.netlify.app'
const clarisApiUrl = 'https://api.claris.su/main'

const bot = new TelegramApi(token, {polling: true})


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

    // console.log('chatId',chatId) // 311462440
//    console.log('message', msg)

    //  https://api.telegram.org/bot5416293431:AAETAbHErxrPHS0kx_aACws_zJS9QqbKnpQ/sendMessage?chat_id=311462440&text=Уведомление о документе №123456&reply_markup={"inline_keyboard":[[{"text":"Открыть","web_app":{"url":"https://incandescent-salmiakki-46088e.netlify.app/show/123456"}}]],"resize_keyboard":true}

    //@getmyid_bot
    // Your user ID: 311462440
    // Current chat ID: 311462440

    //masha
    //1583946214

    // отправка в чат только пользователю работает

    if (text === '/start') {

        await bot.sendMessage(chatId, `Необходима авторизация, введите логин, пароль от системы Кларис`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Авторизация', web_app: {url: webAppUrl + '/login'}, style: {width: 50}}]
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

    // ответ для кнопки keyboard
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

const getMessageText = (message) => {
    if (message?.error === 'invalid_grant') {
        return 'Введен неправильный логин или пароль'
    } else if (message?.access_token) {
        return `Вы авторизованы, ${message.user_name}`
    }
    return 'Ошибка сервера'
}

const getOptions = (method, data) => {
    const dbData = JSON.parse(fs.readFileSync('db.json', {encoding: 'utf8'}))
    const token = dbData[chatId]
    return {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        },
        data
    }
}

app.post('/auth', async (req, res) => {
    const {queryId, login, password} = req.body

    // получение токена
    fetch(clarisApiUrl + '/Token', {
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
    const url = clarisApiUrl + '/vNext/v1/documents/' + req.params["id"]
    const response = await fetch(url, getOptions('GET'))
    if (response.ok) {
        const data = await response.json()
        // console.log('document', data)
        return res.status(200).json(data)
    } else if (response.status === 401) {
        console.log(response.status)
        return res.status(response.status).json({})
    }
})

//получение деталей документа
app.get('/documentDetails/:id', async (req, res) => {
    const url = `${clarisApiUrl}/vNext/v1/agreementHistories?orderBy=date+desc,&filters=NoEmptyAgreed&filterBy=document.id="${req.params["id"]}"`
    const response = await fetch(url, getOptions('GET'))
    if (response.ok) {
        const data = await response.json()
        // console.log('details', data)
        return res.status(200).json(data)
    } else if (response.status === 401) {
        console.log(response.status)
        return res.status(response.status).json({})
    }
})
// Согласовать документ
app.post('/document/:id/agree', async (req, res) => {

    const {comment} = req.body
    const url = `${clarisApiUrl}/vNext/v1/documents/${req.params["id"]}/agree`

    console.log('comment', comment)
    console.log('url', url)

    const options = getOptions('POST', {comment})
    console.log('options',options)
    try {
        const response = await fetch(url, getOptions('POST', {comment}))
        console.log('response', response.status)

        if (response.ok) {
            return res.status(200).json(data)
        } else {
            console.log('else:', response.status)
            return res.status(response.status).json({})
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json(data)
    }


})

// Отклонить документ
app.post('/document/:id/disagree', async (req, res) => {
    const {comment} = req.body
    const url = `${clarisApiUrl}/vNext/v1/documents/${req.params["id"]}/disagree`
    const response = await fetch(url, getOptions('POST', {comment}))

    if (response.ok) {
        const data = await response.json()
        // console.log('document', data)
        return res.status(200).json(data)
    } else if (response.status === 401) {
        console.log(response.status)
        return res.status(response.status).json({})
    }
})
const PORT = 8000

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT)
})

