const ApiError = require('../error/ApiError');
const {postOptions, getOptions} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        try {
            const url = CLARIS_API_URL + '/vNext/v1/documents/' + req.params["id"]
            const response = await fetch(url, getOptions())
            const data = await response.json()
            return res.status(200).json(data)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async agree(req, res, next) {

        try {
            const {comment} = req.body
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/agree`

            await fetch(url, postOptions({comment}))
            return res.status(200).json({})

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async disagree(req, res, next) {
        try {
            const {comment} = req.body
            const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}/disagree`

            await fetch(url, postOptions({comment}))
            return res.status(200).json({})

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new DocumentController();

