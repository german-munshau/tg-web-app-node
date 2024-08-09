const ApiError = require('../error/ApiError');
const {getOptions, getNewToken} = require("../utils/api");

const CLARIS_API_URL = process.env.CLARIS_API_URL

class AgreementHistoryController {

    // async get(req, res, next) {
    //     try {
    //         const url = `${CLARIS_API_URL}/vNext/v1/agreementHistories?orderBy=date+desc,&filters=NoEmptyAgreed&filterBy=document.id="${req.params["id"]}"`
    //         await fetch(url, getOptions())
    //         return res.status(200).json({})
    //     } catch (e) {
    //         next(ApiError.badRequest(e.message))
    //     }
    // }

    async get(req, res, next) {
        try {
            console.log('URL: ', req.originalUrl)
            const url = `${CLARIS_API_URL}/vNext/v1/agreementHistories?orderBy=date+desc,&filters=NoEmptyAgreed&filterBy=document.id="${req.params["id"]}"`
            let response = await fetch(url, getOptions(req.query.chat_id))
            if (response.ok) {
                console.log('status: OK')
                const data = await response.json()
                return res.status(200).json(data)
            } else if (response.status === 401) {
                console.log('status: 401')
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

module.exports = new AgreementHistoryController();

