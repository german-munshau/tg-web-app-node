const fs = require('fs')
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

const postOptions = (data) => {
    return {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }
}

const updateToken = (token, login, password, chatId) => {
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    data[chatId] = {token, login, password}
    fs.writeFileSync(DB, JSON.stringify(data, null, 2), {encoding: "utf8", flag: 'w',});
}

const getNewToken = async (chatId) => {
    console.log('Ошибка авторизации  - получение нового токена по chat_id:', chatId)
    const userData = getUserData(chatId)

    if (userData) {
        const newUserData = await fetch(process.env.CLARIS_API_URL + '/Token', {
            method: "POST",
            body: `grant_type=password&username=${userData.login}&password=${userData.password}`,
            headers: {"Content-Type": "application/x-www-form-urlencoded",},
        })

        const data = await newUserData.json()
        updateToken(data.access_token, userData.login, userData.password, chatId)
        return true
    }
    return false
}

module.exports = {getOptions, postOptions, updateToken, getNewToken}