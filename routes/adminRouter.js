const Router = require('express');
const router = new Router();
const adminController = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/:id', authMiddleware, adminController.getById);

module.exports = router;