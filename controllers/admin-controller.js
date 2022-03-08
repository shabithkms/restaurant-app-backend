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
  addNewItem: async (req, res) => {
    try {
      const { Modifiers } = req.body;
      // converting all id into objectID
      let newModifiers = Modifiers.map((val) => {
        val = { mId: ObjectID(val) };
        return val;
      });
      req.body.Modifiers = newModifiers;
      req.body.isAvailable = true;
      req.body.Price = parseInt(req.body.Price);
      const { Name, Price } = req.body;
      req.body.newPrice = Price;
      // Checking the item exist or not
      let exist = await db.get().collection(collection.ITEM_COLLECTION).findOne({ Name });
      if (!exist) {
        // Adding new item with req.body
        db.get()
          .collection(collection.ITEM_COLLECTION)
          .insertOne(req.body)
          .then(async (response) => {
            // Getting the id of inserted item
            let insertedId = response.insertedId;
            // Checking the item have modifier
            if (Modifiers.length) {
              let sum = await db
                .get()
                .collection(collection.ITEM_COLLECTION)
                .aggregate([
                  {
                    $match: {
                      _id: insertedId,
                    },
                  },
                  {
                    $project: {
                      Name: 0,
                      Category: 0,
                      Description: 0,
                      isAvailable: 0,
                    },
                  },
                  {
                    $unwind: '$Modifiers',
                  },
                  {
                    $project: {
                      mId: '$Modifiers.mId',
                      Price: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: collection.MODIFIER_COLLECTION,
                      localField: 'mId',
                      foreignField: '_id',
                      as: 'Modifier',
                    },
                  },
                  {
                    $project: {
                      Price: 1,
                      Modifier: { $arrayElemAt: ['$Modifier', 0] },
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      total: { $sum: '$Modifier.Price' },
                    },
                  },
                ])
                .toArray();
              // Finding the total with adding modifier sum and item price
              let total = sum[0].total + Price;

              db.get()
                .collection(collection.ITEM_COLLECTION)
                .updateOne(
                  { _id: insertedId },
                  {
                    $set: {
                      newPrice: total,
                    },
                  }
                )
                .then(() => {
                  // Item added and updated the price
                  return res.status(200).json({ message: 'Item added successfully' });
                });
            } else {
              // Item doesnot have Modifier
              return res.status(200).json({ message: 'Item added successfully' });
            }
          });
      } else {
        // Item exist with same name
        return res.status(400).json({ errors: 'item already exist' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  // Get all items
  getAllItems: (req, res) => {
    try {
      return new Promise(async () => {
        let items = await db
          .get()
          .collection(collection.ITEM_COLLECTION)
          .aggregate([
            {
              $unwind: '$Modifiers',
            },
            {
              $project: {
                Name: 1,
                Category: 1,
                Description: 1,
                Price: 1,
                isAvailable: 1,
                newPrice: 1,
                mId: '$Modifiers.mId',
              },
            },
            {
              $lookup: {
                from: collection.MODIFIER_COLLECTION,
                localField: 'mId',
                foreignField: '_id',
                as: 'Modifier',
              },
            },
            {
              $project: {
                Name: 1,
                Category: 1,
                Description: 1,
                Price: 1,
                isAvailable: 1,
                newPrice: 1,
                Modifier: { $arrayElemAt: ['$Modifier', 0] },
              },
            },
            {
              $group: {
                _id: '$_id',
                Name: { $first: '$Name' },
                Category: { $first: '$Category' },
                Description: { $first: '$Description' },
                Price: { $first: '$Price' },
                isAvailable: { $first: '$isAvailable' },
                newPrice: { $first: '$newPrice' },
                Modifiers: { $push: '$Modifier' },
              },
            },
          ])
          .toArray();
        console.log(items);
        return res.status(200).json({ message: 'Success', items });
      });
    } catch (error) {
      // return res.status(500).json({ errors: error.message });
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
      if (!ObjectID.isValid(id)) return res.status(500).json({ errors: 'Please use a valid id' });

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
      if (!ObjectID.isValid(id)) return res.status(500).json({ errors: 'Please use a valid id' });

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
      Price = parseInt(Price);
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
      if (!ObjectID.isValid(id)) return res.status(500).json({ errors: 'Please use a valid id' });

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
        let items = await db
          .get()
          .collection(collection.ITEM_COLLECTION)
          .aggregate([
            {
              $match: {
                isAvailable: true,
              },
            },
            {
              $unwind: '$Modifiers',
            },
            {
              $project: {
                Name: 1,
                Category: 1,
                Description: 1,
                Price: 1,
                isAvailable: 1,
                newPrice: 1,
                mId: '$Modifiers.mId',
              },
            },
            {
              $lookup: {
                from: collection.MODIFIER_COLLECTION,
                localField: 'mId',
                foreignField: '_id',
                as: 'Modifier',
              },
            },
            {
              $project: {
                Name: 1,
                Category: 1,
                Description: 1,
                Price: 1,
                isAvailable: 1,
                newPrice: 1,
                Modifier: { $arrayElemAt: ['$Modifier', 0] },
              },
            },
            {
              $group: {
                _id: '$_id',
                Name: { $first: '$Name' },
                Category: { $first: '$Category' },
                Description: { $first: '$Description' },
                Price: { $first: '$Price' },
                isAvailable: { $first: '$isAvailable' },
                newPrice: { $first: '$newPrice' },
                Modifiers: { $push: '$Modifier' },
              },
            },
          ])
          .toArray();
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
        if (!ObjectID.isValid(id)) return res.status(500).json({ errors: 'Please use a valid id' });
        let item = await db
          .get()
          .collection(collection.ITEM_COLLECTION)
          .aggregate([
            {
              $match: {
                _id: ObjectID(id),
              },
            },
            {
              $unwind: '$Modifiers',
            },
            {
              $project: {
                Name: 1,
                Category: 1,
                Description: 1,
                Price: 1,
                isAvailable: 1,
                newPrice: 1,
                mId: '$Modifiers.mId',
              },
            },
            {
              $lookup: {
                from: collection.MODIFIER_COLLECTION,
                localField: 'mId',
                foreignField: '_id',
                as: 'Modifier',
              },
            },
            {
              $project: {
                Name: 1,
                Category: 1,
                Description: 1,
                Price: 1,
                isAvailable: 1,
                newPrice: 1,
                Modifier: { $arrayElemAt: ['$Modifier', 0] },
              },
            },
            {
              $group: {
                _id: '$_id',
                Name: { $first: '$Name' },
                Category: { $first: '$Category' },
                Description: { $first: '$Description' },
                Price: { $first: '$Price' },
                isAvailable: { $first: '$isAvailable' },
                newPrice: { $first: '$newPrice' },
                Modifiers: { $push: '$Modifier' },
              },
            },
          ])
          .toArray();
        console.log(item);
        if (item.length>0) return res.status(200).json({ message: 'Item details get successfully', item });
        else return res.status(400).json({ errors: 'Item doesnot exist with this ID' });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
};
