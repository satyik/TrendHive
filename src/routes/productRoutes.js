const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin)
 */
router.post('/', requireAuth, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin)
 */
router.put('/:id', requireAuth, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete('/:id', requireAuth, productController.deleteProduct);

// Shopping Cart Routes
/**
 * @route   GET /api/products/cart
 * @desc    Get user's shopping cart
 * @access  Private
 */
router.get('/cart', requireAuth, productController.getCart);

/**
 * @route   POST /api/products/cart/:id
 * @desc    Add product to cart
 * @access  Private
 */
router.post('/cart/:id', requireAuth, productController.addToCart);

/**
 * @route   PUT /api/products/cart/:id
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/cart/:id', requireAuth, productController.updateCartItem);

/**
 * @route   DELETE /api/products/cart/:id
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/cart/:id', requireAuth, productController.removeFromCart);

/**
 * @route   DELETE /api/products/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/cart', requireAuth, productController.clearCart);

// Wishlist Routes
/**
 * @route   GET /api/products/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/wishlist', requireAuth, productController.getWishlist);

/**
 * @route   POST /api/products/wishlist/:id
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/wishlist/:id', requireAuth, productController.addToWishlist);

/**
 * @route   DELETE /api/products/wishlist/:id
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/wishlist/:id', requireAuth, productController.removeFromWishlist);

module.exports = router; 