const { Cart } = require('../models/index');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name brand images finalPrice stock');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < 1) return res.status(400).json({ success: false, message: 'Product out of stock.' });
    if (!size) return res.status(400).json({ success: false, message: 'Please select a size.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        price: product.price,
        finalPrice: product.finalPrice
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name brand images finalPrice stock');
    res.json({ success: true, message: 'Added to cart!', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart.' });

    if (quantity < 1) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name brand images finalPrice stock');
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name brand images finalPrice stock');
    res.json({ success: true, message: 'Item removed.', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, couponDiscount: 0 });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
