const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register customer
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, mobile, role: 'customer' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Admin login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name brand images finalPrice');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, mobile, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, mobile, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add/Update Address
// @route   POST /api/auth/address
const addAddress = async (req, res) => {
  try {
    console.log("ADDRESS REQUEST:");
    console.log(req.body);

    const user = await User.findById(req.user._id);

    console.log("USER BEFORE:");
    console.log(user.addresses);

    const {
      label,
      fullName,
      mobile,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ label, fullName, mobile, addressLine, city, state, pincode, isDefault });
    await user.save();
    

console.log("USER AFTER:");
console.log(user.addresses);

    res.json({ success: true, message: 'Address added!', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Address
// @route   DELETE /api/auth/address/:id
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, message: 'Address removed.', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, adminLogin, getMe, updateProfile, changePassword, addAddress, deleteAddress };
