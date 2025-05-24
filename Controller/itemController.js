const Category = require("../models/CategoryModel");
const Item = require("../models/itemModel");

const addItem = async (req, res) => {
  try {
    const { categoryId, itemName } = req.body;

    const isCategoryAvailable = await Category.findById(categoryId);
    if (!isCategoryAvailable) {
      return res.status(404).json({ message: "the category Not available" });
    }

    const existingItemInSameCate = await Item.findOne({
      itemName,
      categoryName: categoryId,
    });
    if (existingItemInSameCate) {
      return res.status(400).json({ message: "item already added" });
    }

    const newItem = new Item({
      itemName,
      categoryName: categoryId,
    });
    const savedData = await newItem.save();

    if (savedData) {
      res
        .status(200)
        .json({ data: savedData, message: "item added successfully" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "server error" });
  }
};


const getItem= async (req,res)=>{
    try {
        const {categoryId}=req.params
        const itemData= await Item.find({categoryName:categoryId})
        if(itemData){
           return  res.status(200).json({data:itemData,message:'item Data fethed successfully'})
        }else{
            return  res.status(400).json({message:'item not found'})

        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message:'server error'})

    }
}

 const deleteItem = async (req, res) => {
    try {
      const { itemId } = req.params;
      console.log(itemId);
      
      // const isItemAvailable = await Item.findOne({categoryName:itemId})
      // if(isItemAvailable){
      //   console.log( "This category added items");

      //   return res.status(404).json({ success:false,message: "This category added items" });
      // }

      const deletedIteam = await Item.findByIdAndDelete(itemId);
      if (!deletedIteam) {
        return res.status(404).json({ message: "Item not found" });
      } else {
        return res.status(200).json({success:true, message: "Item deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting category:", error.message);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  const editItemName=async (req,res)=>{
    try {
        const {itemId,categoryId,itemName}=req.body
       
            const existingCategory = await Item.findOne({categoryName:categoryId, itemName });
            if (existingCategory && existingCategory._id.toString() !== itemId) {
              return res.status(400).json({success:false, message: "item name already exists" });
            }
        
            const savedCategory = await Item.findByIdAndUpdate(
              itemId,
              { itemName },
              { new: true }
            );
            if (!savedCategory) {
              return res.status(404).json({success:false, message: "item Not Found" });
            } else {
                return res
                .status(200)
                .json({ data: savedCategory, message: "item name updated successfully" });
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({success:false, message: "Server error" });
          }
        };


module.exports = {
  addItem,
  getItem,
  deleteItem,
  editItemName
};
