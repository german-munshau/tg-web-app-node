const Router = require('express');
const router = new Router();
const authController = require('../controllers/authController')


router.get('/', authController.auth);

module.exports = router;