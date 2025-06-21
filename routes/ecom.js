const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/userAuthMiddleware');
const bagController = require('../controllers/bagControllers');

router.get('/', requireAuth, bagController.getBag);
router.post('/add/:id', requireAuth, bagController.addToBag);
router.post('/deleteItem', requireAuth, bagController.deleteItem);
router.post('/clear', requireAuth, bagController.clearBag);

module.exports = router;
