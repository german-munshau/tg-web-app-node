const fs = require('fs')

let {chatId} = require("../utils/global");

const DB = process.env.DB

const getHeaders = () => {
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    const token = data[chatId]
    return {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + token,
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

const updateToken = (token) => {
    console.log('chatId', chatId)
    const data = JSON.parse(fs.readFileSync(DB, {encoding: 'utf8'}))
    data[chatId] = token
    fs.writeFileSync(DB, JSON.stringify(data, null, 2), {encoding: "utf8", flag: 'w',});
}

module.exports = {getOptions, postOptions, updateToken}