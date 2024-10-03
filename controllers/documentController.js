const ApiError = require('../error/ApiError');
const logger = require('../logger')
const {postOptions, getResponse, patchOptions} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        logger.info(`DocumentController get: ${req.originalUrl}`)
        const url = `${CLARIS_API_URL}/vNext/v1/documents?filterBy=serialNumber=${req.query.serialNumber}`
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

    async pay(req, res, next) {
        logger.info(`DocumentController pay: ${req.originalUrl}`)
        const baseUrl = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}`
        try {
            const {chatId} = req.body

            // заменить маршрут
            logger.info(`URL: ${baseUrl} body: ${JSON.stringify(req.body)}`)

            const changedData = {agreementScheme: '5079215165000', comment: 'ТЕСТ АльтСофт!!! замена маршрута'}
            const options = patchOptions(chatId, changedData)

            logger.info(`options: ${JSON.stringify(options)}`)

            const changeAgreementSchemeResponse = await fetch(baseUrl, options)

            logger.info(`Замена маршрута:  ${changeAgreementSchemeResponse.status} ${changeAgreementSchemeResponse.statusText}`)

            if (changeAgreementSchemeResponse.status === 200) {
                // старт маршрута
                const runDocumentResponse = await fetch(baseUrl + '/run', postOptions(chatId))

                logger.info(`Старт маршрута: ${runDocumentResponse.status} ${runDocumentResponse.statusText}`)
                return res.status(200).json({})
            } else {
                return res.status(changeAgreementSchemeResponse.status).json({})
            }

        } catch (e) {
            logger.error(e.errorCode?.message)
            return next(ApiError.common(e.errorCode.message))
        }
    }


}

module.exports = new DocumentController();

