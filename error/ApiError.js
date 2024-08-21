class ApiError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }

    static badRequest(message) {
        return new ApiError(404, message)
    }


    static internal(message) {
        return new ApiError(500, message)
    }


    static forbidden(message) {
        return new ApiError(403, message)
    }

    static common(errorCode, message) {
        if (errorCode === 403) {
            return new ApiError(errorCode, `${message}\n${errorCode} : Доступ запрещен`)
        }
        if (errorCode === 404) {
            return new ApiError(errorCode, `${message}\n${errorCode} : Документ не найден`)
        }
        if (errorCode === 500) {
            return new ApiError(errorCode, `${message}\n${errorCode} : Внутренняя ошибка`)
        }
        return new ApiError(errorCode, message)
    }
}

module.exports = ApiError
