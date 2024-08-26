const ApiError = require('../error/ApiError');
const {getResponse} = require("../utils/api");
const logger = require("../logger");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class AgreementHistoryController {

    async get(req, res, next) {
        logger.info(`AgreementHistoryController get: ${req.originalUrl}`)
        const url = `${CLARIS_API_URL}/vNext/v1/agreementHistories?orderBy=date+desc,&filters=NoEmptyAgreed&filterBy=document.id="${req.params["id"]}"`
        const response = await getResponse(url, req.query.chat_id, true)
        if (response.status === 200) {
            return res.status(200).json(response.data)
        } else {
            logger.error(response.message)
            return next(ApiError.common(response.status, response.message))
        }
    }

}

module.exports = new AgreementHistoryController();

