const Router = require('express');
const router = new Router();
const documentController = require('../controllers/documentController')


router.get('/:id', documentController.getById);
router.get('/', documentController.get);
router.post('/:id/agree', documentController.agree);
router.post('/:id/disagree', documentController.disagree);

module.exports = router;