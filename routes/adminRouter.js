const Router = require('express');
const router = new Router();
const adminController = require('../controllers/adminController')


router.get('/', adminController.get);

module.exports = router;