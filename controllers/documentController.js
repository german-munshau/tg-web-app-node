const ApiError = require('../error/ApiError');
const {postOptions, getOptions, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        console.log('URL: ', req.originalUrl)
        const url = `${CLARIS_API_URL}/vNext/v1/documents?filterBy=serialNumber=${req.query.serialNumber}`
        let response = await fetch(url, getOptions(req.query.chat_id))
        if (response.status === 200) {
            const data = await response.json()
            if (data.length === 0) {
                console.log('status: 404 Документ не найден')
                return next(ApiError.badRequest('Документ не найден'))
            } else {
                console.log('status: OK')
                return res.status(200).json(data[0])
            }
        } else if (response.status === 401) {
            console.log('status: 401 - Получение токена')
            const isNewToken = await getNewToken(req.query.chat_id)
            if (isNewToken) {
                console.log('Повторная попытка выгрузки документа')
                let response = await fetch(url, getOptions(req.query.chat_id))
                if (response.status === 200) {
                    const data = await response.json()

                    if (data.length === 0) {
                        console.log('status: 404 Документ не найден')
                        return next(ApiError.badRequest('Документ не найден'))
                    } else {
                        console.log('status: OK')
                        return res.status(200).json(data[0])
                    }
                } else {
                    return next(ApiError.forbidden('Ошибка выгрузки документа'))
                }
            } else {
                console.log('Не найдено инфо о пользователе в базе бота, необходима авторизация')
                return next(ApiError.forbidden('Необходима авторизация в системе Кларис'))
            }
        }
        console.log('status: 404 Документ не найден')
        return next(ApiError.badRequest('Документ не найден'))
    }


    async getById(req, res, next) {
        console.log('URL: ', req.originalUrl)
        const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}`
        let response = await fetch(url, getOptions(req.query.chat_id))
        if (response.status === 200) {
            const data = await response.json()
            console.log('status: OK')
            return res.status(200).json(data)
        } else if (response.status === 401) {
            console.log('status: 401 - Получение токена')
            const isNewToken = await getNewToken(req.query.chat_id)
            if (isNewToken) {
                console.log('Повторная попытка выгрузки документа')
                let response = await fetch(url, getOptions(req.query.chat_id))
                if (response.status === 200) {
                    const data = await response.json()
                    return res.status(200).json(data)
                } else {
                    return next(ApiError.forbidden('Ошибка выгрузки документа'))
                }
            } else {
                console.log('Не найдено инфо о пользователе в базе бота, необходима авторизация')
                return next(ApiError.forbidden('Необходима авторизация в системе Кларис'))
            }
        }
        console.log('status: 404 Документ не найден')
        return next(ApiError.badRequest('Документ не найден'))
    }

    async agree(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/agree`
            console.log('URL:', url)
            console.log('body: ', req.body)
            const {chatId, messageId, number, comment} = req.body
            const response = await fetch(url, postOptions(chatId, comment))
            console.log('Status:', response.status, response.statusText)
            if (response.status === 200) {
                return await bot.editMessageText(`Документ № ${number} согласован`, {
                    chat_id: chatId,
                    message_id: messageId
                })
            } else {
                const errorMessage = `Ошибка при согласовании документа № ${number}`
                await bot.sendMessage(chatId, errorMessage)
                return next(ApiError.common(response.status, errorMessage))
            }
        } catch (e) {
            return next(ApiError.common(e.errorCode.message))
        }
    }

    async disagree(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/disagree`
            console.log('URL:', url)
            console.log('body: ', req.body)
            const {chatId, messageId, number, comment} = req.body
            const response = await fetch(url, postOptions(chatId, comment))
            console.log('Status:', response.status, response.statusText)
            if (response.status === 200) {
                return await bot.editMessageText(`Документ № ${number} отклонен`, {
                    chat_id: chatId,
                    message_id: messageId
                })
            } else {
                const errorMessage = `Ошибка при отклонении документа № ${number}`
                await bot.sendMessage(chatId, errorMessage)
                return next(ApiError.common(response.status, errorMessage))
            }
        } catch (e) {
            return next(ApiError.common(e.errorCode.message))
        }
    }

    // async agree(req, res, next) {
    //     try {
    //         const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/agree`
    //         console.log('URL:', url)
    //         console.log('body: ', req.body)
    //         const {chatId, messageId, number, comment} = req.body
    //         const response = await fetch(url, postOptions(chatId, comment))
    //         if (response.ok) {
    //             await bot.editMessageText(`Документ № ${number} согласован`, {chat_id: chatId, message_id: messageId})
    //             console.log('Status:', response.status, response.statusText)
    //         }
    //         return res.status(response.status).json({})
    //     } catch (e) {
    //         console.log(e)
    //         next(ApiError.badRequest(e.message))
    //     }
    // }


    // async disagree(req, res, next) {
    //     try {
    //         const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/disagree`
    //         console.log('URL:', url)
    //         console.log('body: ', req.body)
    //         const {chatId, messageId, number, comment} = req.body
    //         const response = await fetch(url, postOptions(chatId, comment))
    //         if (response.ok) {
    //             await bot.editMessageText(`Документ № ${number} отклонен`, {chat_id: chatId, message_id: messageId})
    //             console.log('Status:', response.status, response.statusText)
    //         }
    //         return res.status(response.status).json({})
    //     } catch (e) {
    //         console.log(e)
    //         next(ApiError.badRequest(e.message))
    //     }
    // }

}

module.exports = new DocumentController();

