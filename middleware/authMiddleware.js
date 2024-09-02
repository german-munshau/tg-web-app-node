const fs = require("fs");
const ApiError = require("../error/ApiError");
const DB = process.env.DB


module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {

        console.log('req.headers', req.headers)
        console.log('req.query', req.query)
        console.log('req.params', req.params)

        const {chat_id} = req.query
        console.log('chat_id', chat_id)

        const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
        const userData = data[chat_id]

        console.log('userData', userData)
        if (!userData.token) {
            return ApiError.unauthorized("Необходима авторизация")
        }

        console.log(req.url)
        console.log(req.baseUrl)
        console.log(req.baseApiUrl)

        next()

    } catch (e) {
        // res.status(401).json({message: "Не авторизован"})
       return next(ApiError.unauthorized("Необходима авторизация"))
    }
}
