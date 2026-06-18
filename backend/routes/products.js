const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getSearchSuggestions, createProduct, updateProduct, deleteProduct, getRelatedProducts } = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/:id', optionalAuth, getProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
