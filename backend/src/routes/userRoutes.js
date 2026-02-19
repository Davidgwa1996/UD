const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// All routes are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.post('/avatar', userController.uploadAvatar);
router.get('/orders', userController.getUserOrders);
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist/:productId', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);

module.exports = router;