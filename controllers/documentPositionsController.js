const ApiError = require('../error/ApiError');
const {getOptions, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class DocumentPositionsController {

    async get(req, res, next) {
        try {
            const url = `${CLARIS_API_URL}/vNext/v1/documentPositions?filterBy=document.id="${req.params["id"]}"`

            console.log('documentPositions get by id', url)
            console.log('req.query.chat_id',req.query.chat_id)

            let response = await fetch(url, getOptions(req.query.chat_id))
            if (response.ok) {
                console.log('OK')
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401) {
                const isNewToken = await getNewToken(req.query.chat_id)
                if (isNewToken) {
                    console.log('Повторная попытка выгрузки позиций документа')
                    let response = await fetch(url, getOptions(req.query.chat_id))
                    if (response.ok) {
                        const data = await response.json()
                        return res.status(200).json(data)
                    } else {
                        return res.status(response.status).json({})
                    }
                } else {
                    console.log('Не найдено инфо о пользователе в базе бота, необходима авторизация')
                    return res.status(500).json({message: 'Не найдено инфо о пользователе в базе бота, необходима авторизация'})
                    // return res.status(500).json({})
                }
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new DocumentPositionsController();

