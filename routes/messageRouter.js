const Router = require('express');
const router = new Router();
const messageController = require('../controllers/messageController')


router.get('/send/:id', messageController.get);

module.exports = router;