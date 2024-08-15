const WEB_APP_URL = process.env.WEB_APP_URL

class MessageController {

    async get(req, res, next) {

        try {
            const {chat_id, text} = req.query
            const id = req.params['id']

            const response = await bot.sendMessage(chat_id, text)
            const message_id = response.message_id

            const webAppUrl = WEB_APP_URL + `/show/${id}?chat_id=${chat_id}&message_id=${message_id}`
            await bot.editMessageReplyMarkup({
                inline_keyboard: [
                    [{text: 'Открыть', web_app: {url: webAppUrl}}]
                ]
            }, {chat_id, message_id})

            return res.status(200).json(response)

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: 'Error'})
        }
    }

}


module.exports = new MessageController();

