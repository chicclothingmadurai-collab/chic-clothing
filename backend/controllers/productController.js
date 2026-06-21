const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, brand, category,
      minPrice, maxPrice, size, color, rating, sort, featured, newArrival, bestSeller
    } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (brand) query.brand = { $in: brand.split(',') };
    if (category) query.category = { $in: category.split(',') };
    if (size) query.sizes = { $in: size.split(',') };
    if (color) query['colors.name'] = { $in: color.split(',') };
    if (rating) query.ratings = { $gte: parseFloat(rating) };
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;

    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.finalPrice.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { finalPrice: 1 };
    else if (sort === 'price_desc') sortOption = { finalPrice: -1 };
    else if (sort === 'rating') sortOption = { ratings: -1 };
    else if (sort === 'popularity') sortOption = { soldCount: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search suggestions
// @route   GET /api/products/search/suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' }, name: 1, brand: 1, category: 1 }
    ).sort({ score: { $meta: 'textScore' } }).limit(8);

    const suggestions = products.map(p => ({ _id: p._id, name: p.name, brand: p.brand, category: p.category }));
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    if (typeof productData.colors === 'string') {
      productData.colors = JSON.parse(productData.colors);
    }
    if (typeof productData.sizes === 'string') {
      productData.sizes = JSON.parse(productData.sizes);
    }
    if (typeof productData.tags === 'string') {
      productData.tags = JSON.parse(productData.tags);
    }

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
    }

    // If finalPrice is not provided, compute it from price and discount
    if (productData.finalPrice === undefined && productData.price !== undefined) {
      const discount = productData.discount || 0;
      productData.finalPrice = Math.round(productData.price * (1 - discount / 100));
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, message: 'Product created!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    console.log('📥 Incoming update data:', productData);

    // Parse JSON strings if needed
    if (typeof productData.colors === 'string') productData.colors = JSON.parse(productData.colors);
    if (typeof productData.sizes === 'string') productData.sizes = JSON.parse(productData.sizes);
    if (typeof productData.tags === 'string') productData.tags = JSON.parse(productData.tags);

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({ url: file.path, public_id: file.filename }));
      const existing = await Product.findById(req.params.id);
      productData.images = [...(existing.images || []), ...newImages];
    }

    // --- Fetch existing product ---
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // --- Determine price and discount (use provided or fallback) ---
    const price = productData.price !== undefined
      ? Number(productData.price)
      : existingProduct.price;

    const discount = productData.discount !== undefined
      ? Number(productData.discount)
      : existingProduct.discount;

    // --- Recalculate finalPrice (always) ---
    productData.finalPrice = Math.round(price * (1 - discount / 100));

    console.log(`🔄 Price: ${price}, Discount: ${discount}% → Final: ${productData.finalPrice}`);

    // --- Update the product ---
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    console.log('✅ Updated product:', product);

    res.json({ success: true, message: 'Product updated!', product });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Delete images from cloudinary
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [{ brand: product.brand }, { category: product.category }]
    }).limit(8);

    res.json({ success: true, products: related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts
};