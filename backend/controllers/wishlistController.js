const User = require('../models/User');
const Product = require('../models/Product');

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name brand images finalPrice price discount ratings stock');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    res.json({
      success: true,
      message: idx > -1 ? 'Removed from wishlist.' : 'Added to wishlist!',
      inWishlist: idx === -1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.wishlistCtrl = { getWishlist, toggleWishlist };