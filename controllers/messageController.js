const logger = require("../logger");
const WEB_APP_URL = process.env.WEB_APP_URL

class MessageController {

    async get(req, res, next) {
        try {
            logger.info(`MessageController get: ${req.originalUrl}`)
            const {chat_id, text} = req.query
            const id = req.params['id']

            const data = await bot.sendMessage(chat_id, text)
            const message_id = data.message_id

            const webAppUrl = WEB_APP_URL + `/show/${id}?chat_id=${chat_id}&message_id=${message_id}`
            await bot.editMessageReplyMarkup({
                inline_keyboard: [
                    [{text: 'Открыть', web_app: {url: webAppUrl}}]
                ]
            }, {chat_id, message_id})
            logger.info('OK')
            return res.status(200).json(data)
        } catch (e) {
            console.log(e.body)
            // logger.error(e.errorMessage)
            return res.status(500).json({message: 'Error'})
        }
    }

}


module.exports = new MessageController();

