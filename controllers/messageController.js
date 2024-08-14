const ApiError = require('../error/ApiError');
const {postOptions, getOptions, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL
const TELEGRAM_URL = process.env.TELEGRAM_URL
const BOT_TOKEN = process.env.BOT_TOKEN
const WEB_APP_URL = process.env.WEB_APP_URL

class MessageController {

    async get(req, res, next) {

        console.log('req.params', req.params)
        console.log('req.query', req.query)


        //https://api.telegram.org/bot5416293431:AAETAbHErxrPHS0kx_aACws_zJS9QqbKnpQ/sendMessage?chat_id=311462440&text=Документ № 919 ждёт Вашей визы&reply_markup={"inline_keyboard":[[{"text":"Открыть","web_app":{"url":"https://incandescent-salmiakki-46088e.netlify.app/show/5059814032000?chat_id=311462440"}}]],"resize_keyboard":true}


        try {
            // const telegramURL = `${TELEGRAM_URL}/bot${BOT_TOKEN}/sendMessage?chat_id=${req.query.chat_id}&text=${req.query.text}&reply_markup={"inline_keyboard":[[{"text":"Открыть","web_app":{"url":"https://incandescent-salmiakki-46088e.netlify.app/show/${req.params["id"]}?chat_id=${req.query.chat_id}"}}]],"resize_keyboard":true}`
            // telegramURL = `${TELEGRAM_URL}/bot${BOT_TOKEN}/sendMessage?chat_id=${req.query.chat_id}&text=${req.query.text}&reply_markup={"inline_keyboard":[[{"text":"Открыть","web_app":{"url":"https://incandescent-salmiakki-46088e.netlify.app/show/${req.params["id"]}?chat_id=${req.query.chat_id}"}}]],"resize_keyboard":true}`


            const response = await bot.sendMessage(req.query.chat_id, req.query.text)

            console.log('response.message_id', response.message_id)


            await bot.editMessageReplyMarkup({
                inline_keyboard: [
                    [{
                        text: 'Открыть',
                        web_app: {url: WEB_APP_URL + `/show/${req.params['id']}?chat_id=${req.query.chat_id}&message_id=${response.messageId}`},
                    }]
                ]
            })

            // await bot.sendMessage(req.query.chat_id, req.query.text, {
            //     reply_markup: {
            //         inline_keyboard: [
            //             [{
            //                 text: 'Авторизация',
            //                 web_app: {url: WEB_APP_URL + '/login?messageId=' + messageId},
            //                 style: {width: 50}
            //             }]
            //         ],
            //         resize_keyboard: true,
            //     },
            //
            // })

            // console.log(telegramURL)
            // let response = await fetch(telegramURL)
            const data = await response.json()
            console.log(data)
            return res.status(200).json(data)

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: 'Error'})
        }


        //     console.log('URL: ', req.originalUrl)
        //
        //     const url = `${CLARIS_API_URL}/vNext/v1/documents?filterBy=serialNumber=${req.query.serialNumber}`
        //     let response = await fetch(url, getOptions(req.query.chat_id))
        //
        //     if (response.ok) {
        //         console.log('status: OK')
        //         const data = await response.json()
        //         return res.status(200).json(data)
        //     } else if (response.status === 401) {
        //         console.log('status: 401')
        //         const isNewToken = await getNewToken(req.query.chat_id)
        //         if (isNewToken) {
        //             console.log('Повторная попытка выгрузки документа')
        //             let response = await fetch(url, getOptions(req.query.chat_id))
        //             if (response.ok) {
        //                 const data = await response.json()
        //                 return res.status(200).json(data)
        //             } else {
        //                 return res.status(response.status).json({})
        //             }
        //         } else {
        //             console.log('Не найдено инфо о пользователе в базе бота, необходима авторизация')
        //             return res.status(500).json({message: 'Не найдено инфо о пользователе в базе бота, необходима авторизация'})
        //         }
        //     }
        //
        // } catch (e) {
        //     next(ApiError.badRequest(e.message))
        // }
    }

}


module.exports = new MessageController();

