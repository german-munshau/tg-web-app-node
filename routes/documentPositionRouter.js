const Router = require('express');
const router = new Router();
const documentPositionController = require('../controllers/documentPositionsController')


router.get('/:id', documentPositionController.get);

module.exports = router;