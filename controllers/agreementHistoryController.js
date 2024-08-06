const ApiError = require('../error/ApiError');
const {getOptions} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class AgreementHistoryController {

    async get(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/agreementHistories?orderBy=date+desc,&filters=NoEmptyAgreed&filterBy=document.id="${req.params["id"]}"`
            await fetch(url, getOptions())
            return res.status(200).json({})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new AgreementHistoryController();

