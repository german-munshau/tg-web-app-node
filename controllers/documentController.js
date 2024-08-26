const ApiError = require('../error/ApiError');
const logger = require('../logger')
const {postOptions, getOptions, getNewToken, getResponse} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        logger.info(`DocumentController get: ${req.originalUrl}`)
        const url = `${CLARIS_API_URL}/vNext/v1/documents?filterBy=serialNumber=${req.query.serialNumber}`
        logger.info(`API GET: ${url}`)
        const response = await getResponse(url, req.query.chat_id)
        if (response.status === 200) {
            return res.status(200).json(response.data)
        } else {
            logger.error(response.message)
            return next(ApiError.common(response.status, response.message))
        }
    }

    async getById(req, res, next) {
        logger.info(`DocumentController getById: ${req.originalUrl}`)
        const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}`
        logger.info(`API GET: ${url}`)
        const response = await getResponse(url, req.query.chat_id)
        if (response.status === 200) {
            return res.status(200).json(response.data)
        } else {
            logger.error(response.message)
            return next(ApiError.common(response.status, response.message))
        }
    }

    async agree(req, res, next) {
        logger.info(`DocumentController agree: ${req.originalUrl}`)
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/agree`
            logger.info(`URL: ${url} body: ${JSON.stringify(req.body)}`)
            const {chatId, messageId, number, comment} = req.body
            const response = await fetch(url, postOptions(chatId, comment))
            logger.info(`${response.status} ${response.statusText}`)
            if (response.status === 200) {
                logger.info(`Документ № ${number} согласован`)
                await bot.editMessageText(`Документ № ${number} согласован`, {
                    chat_id: chatId,
                    message_id: messageId
                })
                return res.status(response.status).json({})
            } else {
                const errorMessage = `Ошибка при согласовании документа № ${number}`
                logger.error(errorMessage)
                await bot.sendMessage(chatId, errorMessage)
                return next(ApiError.common(response.status, errorMessage))
            }
        } catch (e) {
            logger.error(e.errorCode?.message)
            return next(ApiError.common(e.errorCode.message))
        }
    }

    async disagree(req, res, next) {
        logger.info(`DocumentController disagree: ${req.originalUrl}`)
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/disagree`
            logger.info(`URL: ${url} body: ${JSON.stringify(req.body)}`)
            const {chatId, messageId, number, comment} = req.body
            const response = await fetch(url, postOptions(chatId, comment))
            logger.info(`${response.status} ${response.statusText}`)
            if (response.status === 200) {
                logger.info(`Документ № ${number} отклонен`)
                await bot.editMessageText(`Документ № ${number} отклонен`, {
                    chat_id: chatId,
                    message_id: messageId
                })
                return res.status(response.status).json({})
            } else {
                const errorMessage = `Ошибка при отклонении документа № ${number}`
                logger.error(errorMessage)
                await bot.sendMessage(chatId, errorMessage)
                return next(ApiError.common(response.status, errorMessage))
            }
        } catch (e) {
            logger.error(e.errorCode?.message)
            return next(ApiError.common(e.errorCode.message))
        }
    }

}

module.exports = new DocumentController();

