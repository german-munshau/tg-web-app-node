const ApiError = require('../error/ApiError');
const {getOptions, getNewToken} = require("../utils/api");
const logger = require("../logger");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentPositionsController {

    async get(req, res, next) {
        try {
            logger.info(`DocumentPositionsController get: ${req.originalUrl}`)
            const url = `${CLARIS_API_URL}/vNext/v1/documentPositions?filterBy=document.id="${req.params["id"]}"`
            let response = await fetch(url, getOptions(req.query.chat_id))
            if (response.ok) {
                logger.info('OK')
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401) {
                logger.info('Получение токена')
                const isNewToken = await getNewToken(req.query.chat_id)
                if (isNewToken) {
                    logger.info('Повторная попытка выгрузки позиций документа')
                    let response = await fetch(url, getOptions(req.query.chat_id))
                    if (response.ok) {
                        logger.info('OK')
                        const data = await response.json()
                        return res.status(200).json(data)
                    } else {
                        logger.error(`${response.status}: Ошибка при выгрузке позиций документа`)
                        return res.status(response.status).json({})
                    }
                } else {
                    logger.error(`${response.status}: Необходима авторизация в системе Кларис`)
                    return res.status(500).json({message: 'Не найдено инфо о пользователе в базе бота, необходима авторизация'})
                }
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new DocumentPositionsController();

