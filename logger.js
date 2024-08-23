const pino = require('pino')

const date = new Date();
const dateTemplate = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2)

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: false,
            destination: `${__dirname}/logs/app-${dateTemplate}.log`,
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname",
        }
    }
})

module.exports = logger;