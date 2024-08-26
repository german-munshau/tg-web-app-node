//const fetch = require('node-fetch');
const logger = require("../logger");
const {getOptions, getNewToken} = require("../utils/api");
const ApiError = require("../error/ApiError");
const CLARIS_API_URL = process.env.CLARIS_API_URL




class AdminController {

    // async getById(req, res, next) {
    //     logger.info(`AdminController getById: ${req.originalUrl}`)
    //     const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}`
    //     logger.info(`API GET: ${url}`)
    //     const response = await getResponse(url, req.query.chat_id)
    //     if (response.status === 200) {
    //         return res.status(200).json(response.data)
    //     } else {
    //         logger.error(response.message)
    //         return next(ApiError.common(response.status, response.message))
    //     }
    // }

    async getById(req, res, next) {
        // logger.info(`AdminController getById: ${req.originalUrl}`)
        // const url = `${CLARIS_API_URL}/vNext/v1/documents/${req.params["id"]}`
        // logger.info(`API GET: ${url}`)
        // const response = await getResponse(url, req.query.chat_id)
        // if (response.status === 200) {
        //     return res.status(200).json(response.data)
        // } else {
        //     logger.error(response.message)
        //     return next(ApiError.common(response.status, response.message))
        // }
        return res.status(200)
    }

}


module.exports = new AdminController();

