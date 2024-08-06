const Router = require('express');
const router = new Router();
const agreementHistoryController = require('../controllers/agreementHistoryController')


router.get('/:id', agreementHistoryController.get);

module.exports = router;