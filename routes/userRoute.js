const router = require('express').Router();
const userController = require('../controllers/userController');

//session routes
router.post('/session/login', userController.login);
router.post('/session/register', userController.register);

//user routes
router.put('/user/change-password', userController.changePassword);
router.put('/user/block', userController.blockUser);
router.put('/user/unblock', userController.unblockUser);
router.put('/user/edit', userController.editUser);
router.delete('/user/delete', userController.deleteUser);

module.exports = router;