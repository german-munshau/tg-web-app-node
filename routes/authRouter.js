const Router = require('express');
const router = new Router();
const authController = require('../controllers/authController')


router.post('/', authController.auth);
router.get('/info', authController.userInfo)

module.exports = router;