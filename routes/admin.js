const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');

// Admin login
router.post('/login', adminController.doAdminLogin);

// Item Management
router.post('/add-new-item',adminController.addNewItem)

// Category Management
router.post('/add-category', adminController.addNewCategory);
router.get('/get-all-categories', adminController.getAllCategory);
router.delete('/delete-category', adminController.deleteCategory);

// Item management
router.get('/get-all-items',adminController.getAllItems)

module.exports = router;
