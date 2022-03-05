const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');

module.exports = {
  doAdminLogin: (req, res) => {
    //   Destructure admin data
    const { Email, Password } = req.body;

    try {
      return new Promise(async (resolve, reject) => {
        //   Checkimg admin email valid or not
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email });
        if (admin) {
          // Matching passwords
          if (admin.Password === Password) {
            // Password matched 
            return res.status(200).json({ message: 'Logged in successfully', admin });
          } else {
            // Password doesnot match
            return res.status(401).json({ errors: 'Incorrect password' });
          }
        } else {
          // Email is incorrect
          return res.status(401).json({ errors: 'Invalid Email' });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  // Get all category
  getAllCategory: (req, res) => {
    try {
      return new Promise(async (resolve, reject) => {
        let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
        return res.status(200).json({ message: 'Success', categories });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  // Add new Category
  addNewCategory: (req, res) => {
    try {
      const { Name } = req.body;
      return new Promise(async (resolve, reject) => {
        // Checking the category already exist or not
        const exist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ Name });
        // If category is not exist
        if (!exist) {
          db.get()
            .collection(collection.CATEGORY_COLLECTION)
            .insertOne({ Name })
            .then(() => {
              return res.status(200).json({ message: 'Category added successfully' });
            });
        } else {
          // Category already exist
          return res.status(400).json({ errors: 'Category already exist' });
        }
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  deleteCategory: (req, res) => {
    try {
      const { id } = req.body;
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .deleteOne({ _id: ObjectID(id) })
          .then((response) => {
            return res.status(200).json({ message: 'Deleted successfully' });
          });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  addNewItem: (req, res) => {
    try {
      console.log(req.body);
      const { Name } = req.body;
      return new Promise(async () => {
        let exist = await db.get().collection(collection.ITEM_COLLECTION).findOne({ Name });
        if (!exist) {
          db.get()
            .collection(collection.ITEM_COLLECTION)
            .insertOne(req.body)
            .then(() => {
              return res.status(200).json({ message: 'Item added successfully' });
            });
        } else {
          return res.status(400).json({ errors: 'item already exist' });
        }
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  getAllItems: (req, res) => {
    try {
      return new Promise(async () => {
        let items = await db.get().collection(collection.ITEM_COLLECTION).find().toArray();
        return res.status(200).json({ message: 'Success', items });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
};
