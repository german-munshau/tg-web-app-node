class AdminController {

    async get(req, res, next) {
        return res.status(200).json({message: 'test'})
    }

}


module.exports = new AdminController();

