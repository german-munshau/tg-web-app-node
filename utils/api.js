const fs = require('fs')
const DB = process.env.DB


const getUserData = () => {
    console.log('chatId:',chatId)
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    return data[chatId]
}

const getHeaders = () => {
    const userData = getUserData()
    return {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + userData.token,
    }
}

const getOptions = () => {
    return {
        method: 'GET',
        headers: getHeaders()
    }
}

const postOptions = (data) => {
    return {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }
}

const updateToken = (token, login, password) => {
    console.log('chatId', chatId)
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    data[chatId] = {token, login, password}
    fs.writeFileSync(DB, JSON.stringify(data, null, 2), {encoding: "utf8", flag: 'w',});
}


module.exports = {getOptions, postOptions, updateToken, getUserData}