const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');

// Admin login
router.post('/login', adminController.doAdminLogin);

// Item Management
router.post('/add-new-item', adminController.addNewItem);

// Category Management
router.post('/add-category', adminController.addNewCategory);
router.get('/get-all-categories', adminController.getAllCategory);
router.delete('/delete-category', adminController.deleteCategory);

// Item management
router.get('/get-all-items', adminController.getAllItems);
router.delete('/delete-item', adminController.deleteItem);
router.get('/get-item-details/:id', adminController.getItemDetails);
router.patch('/edit-item', adminController.editItem);
router.patch('/change-item-status', adminController.changeItemStatus);

// Modifier Management
router.post('/add-new-modifier', adminController.addNewModifier);
router.get('/get-modifiers', adminController.getModifiers);
router.delete('/delete-modifier', adminController.deleteModifier);
router.get('/get-modifier-details/:id', adminController.getModifierDetails);
router.patch('/edit-modifier', adminController.editModifier);

// Public API
// API to list all available menu
router.get('/get-all-available', adminController.getAllAvailable);
// API to get a single item details with ID
router.get('/get-single-item/:id', adminController.getSingleItem);

module.exports = router;
