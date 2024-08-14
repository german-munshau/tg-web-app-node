const ApiError = require('../error/ApiError');
const {postOptions, getOptions, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL
const TELEGRAM_URL = process.env.TELEGRAM_URL
const BOT_TOKEN = process.env.BOT_TOKEN
const WEB_APP_URL = process.env.WEB_APP_URL

class MessageController {

    async get(req, res, next) {

        try {
            const response = await bot.sendMessage(req.query.chat_id, req.query.text)

            const webAppUrl = WEB_APP_URL + `/show/${req.params['id']}?chat_id=${req.query.chat_id}&message_id=${response.messageId}`

            console.log('webAppUrl', webAppUrl)

            await bot.editMessageReplyMarkup({
                inline_keyboard: [
                    [{
                        text: 'Открыть',
                        web_app: {url: webAppUrl},
                    }]
                ]
            }, {
                chat_id: req.query.chat_id,
                message_id: response.message_id
            })

            console.log(response)
            return res.status(200).json(response)

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

