const logger = require("../logger");
const {getOptions, getNewToken} = require("../utils/api");
const ApiError = require("../error/ApiError");
const CLARIS_API_URL = process.env.CLARIS_API_URL


class AdminController {

    async getById(req, res, next) {
        logger.info(`AdminController getById: ${req.originalUrl}`)

        const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}`

        logger.info(`API GET: ${url}`)

        let response = await fetch(url, getOptions(req.query.chat_id))

        if (response.status === 200) {
            const data = await response.json()
            logger.info('OK')
            return res.status(200).json(data)
        } else if (response.status === 401) {
            logger.info('Получение токена')
            const isNewToken = await getNewToken(req.query.chat_id)
            if (isNewToken) {
                logger.info('Повторная попытка выгрузки документа')
                let response = await fetch(url, getOptions(req.query.chat_id))
                if (response.status === 200) {
                    logger.info('OK')
                    const data = await response.json()
                    return res.status(200).json(data)
                } else {
                    logger.error(`${response.status}: Необходима авторизация в системе Кларис`)
                    return next(ApiError.common(response.status, 'Необходима авторизация в системе Кларис'))
                }
            } else {
                logger.error(`${response.status}: Необходима авторизация в системе Кларис`)
                return next(ApiError.common(response.status, 'Необходима авторизация в системе Кларис'))
            }
        }
        logger.error('Документ не найден')
        return next(ApiError.badRequest('Документ не найден'))
    }

}


module.exports = new AdminController();

