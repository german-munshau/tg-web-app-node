const Router = require('express');
const router = new Router();
const messageController = require('../controllers/messageController')


router.get('/document/:id', messageController.get);

module.exports = router;