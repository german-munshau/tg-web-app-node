const ApiError = require('../error/ApiError');
const {getOptions} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentPositionsController {

    async get(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documentPositions?filterBy=document.id="${req.params["id"]}"`
            const response = await fetch(url, getOptions(req.query.chat_id))
            if (response.ok) {
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401){
                console.log(response.status)

                return res.status(response.status).json({})
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new DocumentPositionsController();

