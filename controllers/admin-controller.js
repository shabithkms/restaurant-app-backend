const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');

module.exports = {
  doAdminLogin: (req, res) => {
    //   Destructure admin data
    const { Email, Password } = req.body;
    console.log(req.body);

    try {
      return new Promise(async (resolve, reject) => {
        //   Checkimg admin email valid or not
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email });
        if (admin) {
          // Matching passwords
          if (admin.Password === Password) {
            // Password matched
            delete admin.Password;
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
      console.log(error);
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
  // Delete category with ID
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
  // Add new Domain
  addNewItem: (req, res) => {
    try {
      console.log(req.body);
      const { Name } = req.body;
      req.body.isAvailable = true;
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
  // Get all items
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
  // Delete item with ID
  deleteItem: (req, res) => {
    try {
      const { id } = req.body;
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ITEM_COLLECTION)
          .deleteOne({ _id: ObjectID(id) })
          .then(() => {
            return res.status(200).json({ message: 'Item deleted successfully' });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  // Get item details with ID
  getItemDetails: (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(500).json({ errors: "Didn't get Id" });
      return new Promise(async () => {
        let item = await db
          .get()
          .collection(collection.ITEM_COLLECTION)
          .findOne({ _id: ObjectID(id) });
        return res.status(200).json({ message: 'Success', item });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  // Update Item details
  editItem: (req, res) => {
    try {
      const { Name, Category, Description, Price, id } = req.body.formData;
      if (!id) return res.status(500).json({ errors: "Didn't get Id" });
      return new Promise(() => {
        db.get()
          .collection(collection.ITEM_COLLECTION)
          .updateOne(
            { _id: ObjectID(id) },
            {
              $set: {
                Name,
                Category,
                Description,
                Price,
              },
            }
          )
          .then((response) => {
            return res.status(200).json({ message: 'updated successfully' });
          });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  // Change item availability
  changeItemStatus: (req, res) => {
    try {
      return new Promise(() => {
        const { id, status } = req.body;
        db.get()
          .collection(collection.ITEM_COLLECTION)
          .updateOne(
            { _id: ObjectID(id) },
            {
              $set: {
                isAvailable: status,
              },
            }
          )
          .then((response) => {
            res.status(200).json({ message: 'success' });
          });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },

  // Modifier Management
  addNewModifier: (req, res) => {
    try {
      const { Name, Price } = req.body;
      return new Promise(async () => {
        let exist = await db.get().collection(collection.MODIFIER_COLLECTION).findOne({ Name });
        if (!exist) {
          db.get()
            .collection(collection.MODIFIER_COLLECTION)
            .insertOne({ Name, Price })
            .then((response) => {
              return res.status(200).json({ message: 'Added successfully' });
            });
        } else {
          return res.status(400).json({ errors: 'Item already exist' });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  // Get all modifiers
  getModifiers: (req, res) => {
    try {
      return new Promise(async () => {
        let modifiers = await db.get().collection(collection.MODIFIER_COLLECTION).find().toArray();
        res.status(200).json({ message: 'success', modifiers });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  deleteModifier: (req, res) => {
    try {
      const { id } = req.body;
      return new Promise(async () => {
        db.get()
          .collection(collection.MODIFIER_COLLECTION)
          .deleteOne({ _id: ObjectID(id) })
          .then((response) => {
            console.log(response);
            if (response.deletedCount > 0) res.status(200).json({ message: 'Deleted successfully' });
            else res.status(200).json({ message: 'Something error' });
          });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  getModifierDetails: (req, res) => {
    try {
      const { id } = req.params;
      return new Promise(async () => {
        let modifier = await db
          .get()
          .collection(collection.MODIFIER_COLLECTION)
          .findOne({ _id: ObjectID(id) });
        return res.status(200).json({ message: 'success', modifier });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  // Edit modifier
  editModifier: (req, res) => {
    try {
      const { id, Name, Price } = req.body.formData;
      return new Promise(async () => {
        db.get()
          .collection(collection.MODIFIER_COLLECTION)
          .updateOne(
            { _id: ObjectID(id) },
            {
              $set: {
                Name,
                Price,
              },
            }
          )
          .then(() => {
            return res.status(200).json({ message: 'Updated successfully' });
          });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },

  // PUBLIC API
  // get all available menu
  getAllAvailable: (req, res) => {
    try {
      return new Promise(async () => {
        let items = await db.get().collection(collection.ITEM_COLLECTION).find({ isAvailable: true }).toArray();
        return res.status(200).json({ message: 'Get items successfully', items });
      });
    } catch (error) {
      return res.status(500).json({ errors: error.message });
    }
  },
  // Get single menu item details
  getSingleItem: (req, res) => {
    try {
      const { id } = req.params;
      return new Promise(async () => {
        let item = await db
          .get()
          .collection(collection.ITEM_COLLECTION)
          .findOne({ _id: ObjectID(id) });
        return res.status(200).json({ message: 'Item details get successfully', item });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
};
