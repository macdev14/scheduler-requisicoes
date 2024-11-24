const router = require('express').Router();
const requisitionController = require('../controllers/requisitionController');

//requisition routes
router.post('/requisition/send', requisitionController.register);

module.exports = router;