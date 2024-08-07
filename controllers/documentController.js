const ApiError = require('../error/ApiError');
const {postOptions, getOptions, updateToken, getUserData, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        try {
            const url = CLARIS_API_URL + '/vNext/v1/documents/' + req.params["id"]
            console.log(url)
            console.log(getOptions(req.query.chat_id))

            let response = await fetch(url, getOptions(req.query.chat_id))

            console.log('response.json:', await response.json())
            if (response.ok) {
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401) {
                await getNewToken(req.query.chat_id)
                console.log('Повтор выгрузки')
                let response = await fetch(url, getOptions(req.query.chat_id))
                if (response.ok) {
                    const data = await response.json()
                    return res.status(200).json(data)
                } else {
                    return res.status(response.status).json({})
                }
            }

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

