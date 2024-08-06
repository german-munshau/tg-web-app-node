const ApiError = require('../error/ApiError');
const {postOptions, getOptions, updateToken, getUserData} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentController {

    async get(req, res, next) {
        try {
            const url = CLARIS_API_URL + '/vNext/v1/documents/' + req.params["id"]
            let response = await fetch(url, getOptions())
            if (response.ok) {
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401) {
                console.log(response.status)


                // повторное получение нового токена и повтор выгрузки
                const userData = getUserData()

                fetch(CLARIS_API_URL + '/Token', {
                    method: "POST",
                    body: `grant_type=password&username=${userData.login}&password=${userData.password}`,
                    headers: {"Content-Type": "application/x-www-form-urlencoded",},
                }).then((response) => response.json())
                    .then(async (data) => {
                        console.log('updateToken', data)
                        updateToken(data.access_token, userData.login, userData.password)
                    })
                //
                let response = await fetch(url, getOptions())
                if (response.ok) {
                    const data = await response.json()
                    return res.status(200).json(data)
                } else return res.status(response.status).json({})
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

