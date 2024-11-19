const ApiError = require('../error/ApiError');
const {updateToken, getResponse} = require("../utils/api");
const logger = require("../logger");

const CLARIS_API_URL = process.env.CLARIS_API_URL

const getMessageText = (message) => {
    if (message?.error === 'invalid_grant') {
        return 'Введен неправильный логин или пароль'
    } else if (message?.access_token) {
        return `Вы авторизованы, ${message.user_name}`
    }
    return 'Ошибка сервера'
}

class AuthController {


    async getCurrentInfoUser(req, res, next) {
        logger.info(`CurrentInfoUser get: ${req.originalUrl}`)
        const url = `${CLARIS_API_URL}/vNext/v1/users/current`
        const response = await getResponse(url, req.query.chat_id, true)
        if (response.status === 200) {
            return res.status(200).json(response.data)
        } else {
            logger.error(response.message)
            return next(ApiError.common(response.status, response.message))
        }
    }


    async auth(req, res, next) {
        try {
            logger.info(`AuthController auth: ${req.originalUrl} body: ${JSON.stringify(req.body)}`)
            const {queryId, login, password, chatId, messageId} = req.body
            fetch(CLARIS_API_URL + '/Token', {
                method: "POST",
                body: `grant_type=password&username=${login}&password=${password}`,
                headers: {"Content-Type": "application/x-www-form-urlencoded",},
            })
                .then((response) => response.json())
                .then(async (data) => {

                    logger.info(`Data Auth: ${JSON.stringify(data)}`);

                    // загрузить инфо о пользователе

                    //data.access_token
                    const currentUserUrl = `${CLARIS_API_URL}/vNext/v1/users/current`

                    const options = {
                        method: 'GET',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + data.access_token,
                        }
                    }

                    const currentUserResponse = await fetch(currentUserUrl, options)

                    const userData = await currentUserResponse.json()

                    logger.info(`UserData: ${JSON.stringify(userData)}`);

                    updateToken(data.access_token, login, password, chatId)
                    try {
                        await bot.answerWebAppQuery(queryId, {
                            type: 'article',
                            id: queryId,
                            title: 'Ответ от бота',
                            input_message_content: {
                                message_text: getMessageText(data),
                            }
                        })
                        if (data?.access_token) {
                            logger.info('Access granted')
                            await bot.deleteMessage(chatId, messageId)
                        } else {
                            logger.error(`status: ${data?.error}, ${data?.error_description}`)
                        }
                        return res.status(200).json({})
                    } catch (e) {
                        return res.status(500).json({})
                    }
                })
                .catch(async (e) => {
                    next(ApiError.badRequest(e.message))
                });
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

}

module.exports = new AuthController();

