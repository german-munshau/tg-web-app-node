const ApiError = require('../error/ApiError');
const {postOptions, getOptions, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        try {
            console.log('URL: ', req.originalUrl)
            const url = `${CLARIS_API_URL}/vNext/v1/documents?filterBy=serialNumber=${req.query.serialNumber}`
            let response = await fetch(url, getOptions(req.query.chat_id))
            if (response.ok) {
                const data = await response.json()
                if (data.length === 0) {
                    console.log('status: 404 Not Found', data)
                    return res.status(404).json(data)
                } else {
                    console.log('status: OK')
                    return res.status(200).json(data)
                }
            } else if (response.status === 401) {
                console.log('status: 401')
                const isNewToken = await getNewToken(req.query.chat_id)
                if (isNewToken) {
                    console.log('Повторная попытка выгрузки документа')
                    let response = await fetch(url, getOptions(req.query.chat_id))
                    if (response.ok) {
                        const data = await response.json()
                        return res.status(200).json(data)
                    } else {
                        return res.status(response.status).json({})
                    }
                } else {
                    console.log('Не найдено инфо о пользователе в базе бота, необходима авторизация')
                    return res.status(500).json({message: 'Не найдено инфо о пользователе в базе бота, необходима авторизация'})
                }
            }

        } catch (e) {
            console.log('error', e)
            console.log('error.message', e.message)
            return res.status(500).json({message: 'Ошибка сервера'})
            // next(ApiError.badRequest(e.message))
        }
    }

    async getById(req, res, next) {
        try {
            console.log('URL: ', req.originalUrl)
            const url = CLARIS_API_URL + '/vNext/v1/documents/' + req.params["id"]
            let response = await fetch(url, getOptions(req.query.chat_id))
            if (response.ok) {
                console.log('status: OK')
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401) {
                console.log('status: 401')
                const isNewToken = await getNewToken(req.query.chat_id)
                if (isNewToken) {
                    console.log('Повторная попытка выгрузки документа')
                    let response = await fetch(url, getOptions(req.query.chat_id))
                    if (response.ok) {
                        const data = await response.json()
                        return res.status(200).json(data)
                    } else {
                        return res.status(response.status).json({})
                    }
                } else {
                    console.log('Не найдено инфо о пользователе в базе бота, необходима авторизация')
                    return res.status(500).json({message: 'Не найдено инфо о пользователе в базе бота, необходима авторизация'})
                }
            } else {
                console.log('status:', response.status, response.statusText)
                return res.status(response.status).json({})
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async agree(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/agree`
            console.log('URL:', url)
            console.log('body: ', req.body)
            const {chatId, messageId, number, comment} = req.body
            const response = await fetch(url, postOptions(chatId, comment))
            if (response.ok) {
                await bot.editMessageText(`Документ № ${number} согласован`, {chat_id: chatId, message_id: messageId})
                console.log('Status:', response.status, response.statusText)
            }
            return await res.status(response.status).json({})
        } catch (e) {
            console.log(e)
            next(ApiError.badRequest(e.message))
        }
    }


    async disagree(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/disagree`
            console.log('URL:', url)
            console.log('body: ', req.body)
            const {chatId, messageId, number, comment} = req.body
            const response = await fetch(url, postOptions(chatId, comment))
            if (response.ok) {
                await bot.editMessageText(`Документ № ${number} отклонен`, {chat_id: chatId, message_id: messageId})
                console.log('Status:', response.status, response.statusText)
            }
            return res.status(response.status).json({})
        } catch (e) {
            console.log(e)
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new DocumentController();

