const ApiError = require('../error/ApiError');
const {updateToken, getResponse, getUserData} = require("../utils/api");
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

    async userInfo(req, res, next) {
        logger.info(`AuthController getUserInfo : ${req.originalUrl}`)
        try {
            const data = getUserData(req.query.chat_id)
            return res.status(200).json(data)
        } catch (e) {
            const message = 'Ошибка при получении данных пользователя из БД'
            logger.error(message)
            return next(ApiError.internal(message))
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
                    const userInfoUrl = `${CLARIS_API_URL}/vNext/v1/users/current`
                    const options = {
                        method: 'GET',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + data.access_token,
                        }
                    }
                    const userInfoResponse = await fetch(userInfoUrl, options)
                    const userInfo = await userInfoResponse.json()
                    updateToken(chatId, data.access_token, login, password, {...userInfo})
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

