const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile, deposit, withdraw, updateUser, deleteUser, updateProfile, uploadProfilePhoto } = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public/User routes (MUST define broad routes before specific parameters)
router.put('/profile-update', auth, updateProfile);
router.post('/upload-photo', auth, upload.single('photo'), uploadProfilePhoto);
router.get('/profile', auth, getUserProfile);
router.post('/deposit', auth, deposit);
router.post('/withdraw', auth, withdraw);

// Admin only routes
router.get('/', auth, admin, getUsers);
router.put('/:id', auth, admin, updateUser);
router.delete('/:id', auth, admin, deleteUser);

module.exports = router;
