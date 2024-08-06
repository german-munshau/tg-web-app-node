const ApiError = require('../error/ApiError');
const {updateToken} = require("../utils/api");
const {bot} = require("../utils/global");

const CLARIS_API_URL = process.env.CLARIS_API_URL


const getMessageText = (message) => {
    if (message?.error === 'invalid_grant') {
        return 'Введен неправильный логин или пароль'
    } else if (message?.access_token) {
        return `Вы авторизованы, ${message.user_name}`
    }
    return 'Ошибка сервера'
}

class DocumentController {

    async auth(req, res, next) {
        try {
            const {queryId, login, password} = req.body

            console.log('queryId, login, password', queryId, login, password)
            console.log('CLARIS_API_URL',CLARIS_API_URL)

            fetch(CLARIS_API_URL + '/Token', {
                method: "POST",
                body: `grant_type=password&username=${login}&password=${password}`,
                headers: {"Content-Type": "application/x-www-form-urlencoded",},
            }).then((response) => response.json())
                .then(async (data) => {

                    console.log('data', data)
                    updateToken(data?.access_token)

                    // ответ на бота
                    try {
                        await bot.answerWebAppQuery(queryId, {
                            type: 'article',
                            id: queryId,
                            title: 'Ответ от бота',
                            input_message_content: {
                                message_text: getMessageText(data),
                            }
                        })
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

module.exports = new DocumentController();

