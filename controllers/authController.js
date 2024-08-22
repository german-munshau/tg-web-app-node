const ApiError = require('../error/ApiError');
const {updateToken} = require("../utils/api");

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
    async auth(req, res, next) {
        try {
            console.log('URL: ', req.originalUrl)
            console.log('body: ', req.body)
            const {queryId, login, password, chatId, messageId} = req.body
            fetch(CLARIS_API_URL + '/Token', {
                method: "POST",
                body: `grant_type=password&username=${login}&password=${password}`,
                headers: {"Content-Type": "application/x-www-form-urlencoded",},
            })
                .then((response) => response.json())
                .then(async (data) => {
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

                        console.log('data',data)

                        await bot.deleteMessage(chatId, messageId)
                        console.log('status: OK')
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

