const fs = require('fs')
const logger = require("../logger");

const DB = process.env.DB


const getUserData = (chatId) => {
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    return data[chatId]
}

const getHeaders = (chatId) => {
    const userData = getUserData(chatId)
    return {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + userData?.token,
    }
}

const getOptions = (chatId) => {
    return {
        method: 'GET',
        headers: getHeaders(chatId)
    }
}

const postOptions = (chatId, comment) => {
    return {
        method: 'POST',
        headers: getHeaders(chatId),
        body: JSON.stringify({comment})
    }
}

const patchOptions = (chatId, changedData) => {
    const headers = getHeaders(chatId)
    return {
        method: 'PATCH',
        headers,
        body: JSON.stringify(changedData)
    }
}

const updateToken = (token, login, password, chatId) => {
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    data[chatId] = {token, login, password}
    fs.writeFileSync(DB, JSON.stringify(data, null, 2), {encoding: "utf8", flag: 'w',});
}

const getNewToken = async (chatId) => {
    logger.error(`Ошибка авторизации  - получение нового токена по chat_id: ${chatId}`)
    const userData = getUserData(chatId)
    if (userData) {
        const newUserData = await fetch(process.env.CLARIS_API_URL + '/Token', {
            method: "POST",
            body: `grant_type=password&username=${userData.login}&password=${userData.password}`,
            headers: {"Content-Type": "application/x-www-form-urlencoded",},
        })

        const data = await newUserData.json()
        if (data?.access_token) {
            updateToken(data.access_token, userData.login, userData.password, chatId)
            return true
        } else return false

    }
    return false
}

const getResponse = async (url, chatId, multiple = false) => {
    logger.info(`API GET: ${url}`)
    const response = await fetch(url, getOptions(chatId))
    if (response.status === 200) {
        const data = await response.json()
        if (Array.isArray(data) && !multiple) {
            if (data.length === 0) {
                logger.error(`Документ не найден`)
                return {status: 404, message: 'Документ не найден'}
            } else {
                logger.info('OK')
                return {status: 200, data: data[0]}
            }
        } else {
            logger.info('OK')
            return {status: 200, data}
        }
    } else if (response.status === 401) {
        logger.info('Получение токена')
        const isNewToken = await getNewToken(chatId)
        if (isNewToken) {
            logger.info('Повторная попытка выгрузки данных')
            let response = await fetch(url, getOptions(chatId))
            if (response.status === 200) {
                logger.info('OK')
                const data = await response.json()
                return {status: 200, data}
            } else {
                logger.error(`${response.status}: Необходима авторизация в системе Кларис`)
                return {status: response.status, message: 'Необходима авторизация в системе Кларис'}
            }
        } else {
            logger.error(`${response.status}: Необходима авторизация в системе Кларис`)
            return {status: response.status, message: 'Необходима авторизация в системе Кларис'}
        }
    }
    return {status: 404, message: 'Не найдено'}
}


module.exports = {postOptions, updateToken, getResponse, patchOptions}