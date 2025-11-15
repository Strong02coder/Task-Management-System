const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generatetoken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine user role
        let role = 'member';
        if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
            role = 'admin';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
        });

        // Save the user to the database
        await newUser.save();

        // Return user data with JWT token
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            profileImageUrl: newUser.profileImageUrl,
            role: newUser.role,
            token: generatetoken(newUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Return user data with JWT token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generatetoken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Requires JWT)
const getUserProfile = async (req, res) => {
    try {
        // req.user is populated by the 'protect' middleware
        // .select('-password') ensures the hashed password is not sent
        const user = await User.findById(req.user._id).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Requires JWT)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, profileImageUrl, password } = req.body;

        // --- OPTIMIZATION 1: Robust update logic ---
        // Check if properties were provided, allowing for "falsy" values like ""
        if (name !== undefined) {
            user.name = name;
        }

        if (profileImageUrl !== undefined) {
            user.profileImageUrl = profileImageUrl;
        }

        // --- OPTIMIZATION 2: Validate email uniqueness on change ---
        if (email !== undefined && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }
        
        // --- END OPTIMIZATIONS ---

        // Handle password update separately
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        // Return updated user data and a new token
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImageUrl: updatedUser.profileImageUrl,
            role: updatedUser.role,
            token: generatetoken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};