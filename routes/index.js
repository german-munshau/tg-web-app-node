const Router = require('express');
const router = new Router();
const documentRouter = require('./documentRouter')
const documentPositionRouter = require('./documentPositionRouter')
const agreementHistoryRouter = require('./agreementHistoryRouter')
const messageRouter = require('./messageRouter')
const authRouter = require('./authRouter')

router.get('/', async (req, res) => {
    return res.send('Server is working...')
})

router.use('/auth', authRouter);
router.use('/message', messageRouter);
router.use('/documents', documentRouter);
router.use('/documentPositions', documentPositionRouter);
router.use('/agreementHistory', agreementHistoryRouter);

module.exports = router;