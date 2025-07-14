const Product = require('../models/product.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    next(new AppError('Failed to fetch products', 500));
  }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    next(new AppError('Failed to fetch product', 500));
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Admin)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      stock: stock || 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    next(new AppError('Failed to create product', 500));
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    next(new AppError('Failed to update product', 500));
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    next(new AppError('Failed to delete product', 500));
  }
};

// Shopping Cart Controllers

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/products/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const user = req.user;
    const bagItems = user.bagItems || [];

    if (bagItems.length === 0) {
      return res.json({
        success: true,
        data: {
          items: [],
          total: 0,
          quantity: 0,
          discount: 0
        }
      });
    }

    const cartItems = [];
    let total = 0;
    let quantity = 0;

    for (const item of bagItems) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const itemTotal = product.price * item.quantity;
      cartItems.push({
        product,
        quantity: item.quantity,
        total: itemTotal
      });

      total += itemTotal;
      quantity += item.quantity;
    }

    res.json({
      success: true,
      data: {
        items: cartItems,
        total,
        quantity,
        discount: 0 // No discount applied
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    next(new AppError('Failed to fetch cart', 500));
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/products/cart/:id
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const user = await User.findById(userId);
    const bagItems = [...user.bagItems];

    // Check if product already in cart
    const existingItemIndex = bagItems.findIndex(item => item.productId.toString() === id);
    
    if (existingItemIndex !== -1) {
      bagItems[existingItemIndex].quantity += 1;
    } else {
      bagItems.push({ productId: id, quantity: 1 });
    }

    await User.findByIdAndUpdate(userId, { bagItems });

    res.json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        bagItems
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    next(new AppError('Failed to add product to cart', 500));
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/products/cart/:id
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }

    const user = await User.findById(userId);
    const bagItems = [...user.bagItems];

    const itemIndex = bagItems.findIndex(item => item.productId.toString() === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in cart'
      });
    }

    bagItems[itemIndex].quantity = quantity;
    await User.findByIdAndUpdate(userId, { bagItems });

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        bagItems
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    next(new AppError('Failed to update cart', 500));
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/products/cart/:id
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const bagItems = user.bagItems.filter(item => item.productId.toString() !== id);

    await User.findByIdAndUpdate(userId, { bagItems });

    res.json({
      success: true,
      message: 'Product removed from cart successfully',
      data: {
        bagItems
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    next(new AppError('Failed to remove product from cart', 500));
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/products/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { bagItems: [] });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    next(new AppError('Failed to clear cart', 500));
  }
};

// Wishlist Controllers

/**
 * @desc    Get user's wishlist
 * @route   GET /api/products/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const user = req.user;
    const wishlistItems = user.wishListItems || [];

    if (wishlistItems.length === 0) {
      return res.json({
        success: true,
        data: {
          items: []
        }
      });
    }

    const products = [];
    for (const item of wishlistItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        products.push(product);
      }
    }

    res.json({
      success: true,
      data: {
        items: products
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    next(new AppError('Failed to fetch wishlist', 500));
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/products/wishlist/:id
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const user = await User.findById(userId);
    const wishlistItems = [...user.wishListItems];

    // Check if product already in wishlist
    const existingItem = wishlistItems.find(item => item.productId.toString() === id);
    
    if (!existingItem) {
      wishlistItems.push({ productId: id });
      await User.findByIdAndUpdate(userId, { wishListItems: wishlistItems });
    }

    res.json({
      success: true,
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    next(new AppError('Failed to add product to wishlist', 500));
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/products/wishlist/:id
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const wishlistItems = user.wishListItems.filter(item => item.productId.toString() !== id);

    await User.findByIdAndUpdate(userId, { wishListItems: wishlistItems });

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    next(new AppError('Failed to remove product from wishlist', 500));
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist
}; 