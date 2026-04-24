const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.deposit = async (req, res) => {
    const { amount, pin } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.transactionPin !== pin) {
            return res.status(401).json({ message: "Invalid Transaction PIN" });
        }

        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ message: "Invalid deposit amount" });
        }

        user.amount += depositAmount;
        if (!user.transactions) user.transactions = [];
        user.transactions.push({ type: 'deposit', amount: depositAmount });
        await user.save();
        res.json({ message: "Deposit successful", newBalance: user.amount, transactions: user.transactions });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.withdraw = async (req, res) => {
    const { amount, pin } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.transactionPin !== pin) {
            return res.status(401).json({ message: "Invalid Transaction PIN" });
        }

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }

        if (user.amount < withdrawAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        user.amount -= withdrawAmount;
        if (!user.transactions) user.transactions = [];
        user.transactions.push({ type: 'withdraw', amount: withdrawAmount });
        await user.save();
        res.json({ message: "Withdrawal successful", newBalance: user.amount, transactions: user.transactions });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        console.log("Updating profile for user:", req.user.id);
        const { name, transactionPin } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, transactionPin },
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Profile updated successfully', updatedUser });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const profilePhoto = `/uploads/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePhoto },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Photo uploaded successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated successfully', updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
