const Router = require('express');
const router = new Router();
const documentRouter = require('./documentRouter')
const documentPositionRouter = require('./documentPositionRouter')
const agreementHistoryRouter = require('./agreementHistoryRouter')
const messageRouter = require('./messageRouter')
const authRouter = require('./authRouter')
const adminRouter = require('./adminRouter')
const logger = require('../logger')

router.get('/', async (req, res) => {
    logger.info('Server is working...')
    return res.send('Server is working...')
})

router.use('/auth', authRouter);
router.use('/send', messageRouter);
router.use('/documents', documentRouter);
router.use('/documentPositions', documentPositionRouter);
router.use('/agreementHistory', agreementHistoryRouter);
router.use('/admin', adminRouter);

module.exports = router;