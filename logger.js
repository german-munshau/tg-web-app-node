const pino = require('pino')


// logger levels
// logger.fatal('fatal');
// logger.error('error');
// logger.warn('warn');
// logger.info('info');
// logger.debug('debug');
// logger.trace('trace');

// const getLogFileName = () => {
//     const date = new Date();
//     const res = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2)
//     return res
// }


const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    colorize: false,
                    destination: `${__dirname}/logs/app-trace.log`,
                    translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
                    ignore: "pid,hostname",
                    mkdir: true,
                }
            },
            {
                target: 'pino-pretty',
                level: "error",
                options: {
                    colorize: false,
                    destination: `${__dirname}/logs/app-error.log`,
                    translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
                    ignore: "pid,hostname",
                    mkdir: true,
                }
            },
            {
                target: 'pino-pretty',
            },
        ]
    }
})

module.exports = logger;