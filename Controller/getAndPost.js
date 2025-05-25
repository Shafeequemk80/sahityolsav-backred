const Result = require("../models/resultModel");
const ImageData = require("../models/imageDataModel");
const TeamPoint = require("../models/teamPointModel");
const { default: mongoose } = require("mongoose");
const Category = require("../models/CategoryModel");
const Item = require("../models/itemModel");
const startProgramModel = require("../models/startProgram");
const AddBrochureModel = require("../models/Brochure");
const Team = require("../models/Team");
const addDescriptionModel = require("../models/ThemeModel");
// Update the image record

const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const startProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOneAndUpdate(
      {}, // no filter — update any existing document
      { startProgram: true }, // set to true
      { upsert: true, new: true } // create if not exists, return updated document
    );

    if (program) {
      res.status(200).json({
        success: true,
        message: "Program started",
      });
    }
  } catch (error) {
    console.error("Error starting program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const stopProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOneAndUpdate(
      {}, // no filter — update any existing document
      { startProgram: false }, // set to false
      { upsert: true, new: true } // create if not exists, return updated document
    );

    // Delete all results
    const deleteAllResult = await Result.deleteMany({}); // Deletes all documents

    if (program&&deleteAllResult) {
      res.status(200).json({
        success: true,
        message: "Program stopped",
      });
    }else{
       res.status(400).json({
        success: false,
        message: "Program stoping failed",
      });
    }
  } catch (error) {
    console.error("Error stopping program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOneAndUpdate(
      {}, 
      { startProgram: false }, 
      { upsert: true, new: true }
    );

    // Delete all data from collections
    const [resultDel, teamDel, pointDel, categoryDel, descDel, itemDel] = await Promise.all([
      Result.deleteMany({}),
      Team.deleteMany({}),
      TeamPoint.deleteMany({}),
      Category.deleteMany({}),
      addDescriptionModel.deleteMany({}),
      Item.deleteMany({}),
    ]);

    const allSuccessful = program && 
      resultDel.acknowledged && 
      teamDel.acknowledged && 
      pointDel.acknowledged && 
      categoryDel.acknowledged && 
      descDel.acknowledged && 
      itemDel.acknowledged;

    if (allSuccessful) {
      res.status(200).json({
        success: true,
        message: "Program reset successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Program reset failed",
      });
    }

  } catch (error) {
    console.error("Error resetting program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const checkStartProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOne();
    console.log(program);

    res.status(200).json({
      success: program.startProgram,
    });
  } catch (error) {
    console.error("Error starting program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getData = async (req, res) => {
  try {
    const { category, item } = req.query;
    console.log(category, item);

    const resultData = await Result.findOne({ category, item }).populate(
      "category item"
    );

    if (resultData) {
      return res.status(200).json({
        data: resultData,
        success: true,
      });
    } else {
      const itemData = await Item.findOne({
        categoryName: category,
        _id: item,
      }).populate("categoryName");

      return res.status(200).json({
        data: {
          category: {
            categoryName: itemData.categoryName?.categoryName,
          },
          item: {
            itemName: itemData.itemName,
          },
          result: false,
        },
        success: false,
        message: "Not published",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addImage = async (req, res) => {
  try {
    let colors = req.body.color.split(",");
    const existingImages = await ImageData.findOne();

    let updatedImages = {
      image1: { image: null, color: colors[0] || "light" },
      image2: { image: null, color: colors[1] || "light" },
      image3: { image: null, color: colors[2] || "light" },
    };

    const images = ["image1", "image2", "image3"];

    if (existingImages) {
      // If images already exist, delete the old files if new ones are provided
      images.forEach((imageKey, index) => {
        if (req.files[imageKey]) {
          if (existingImages[imageKey].image) {
            cloudinary.uploader.destroy(
              existingImages[imageKey].public_id,
              (error, result) => {
                if (error) {
                  console.error("Error deleting image:", error);
                }
              }
            );
          }
          updatedImages[imageKey].image = req.files[imageKey][0].path;
          updatedImages[imageKey].public_id = req.files[imageKey][0].filename;
        } else {
          updatedImages[imageKey].image = existingImages[imageKey].image;
          updatedImages[imageKey].public_id =
            existingImages[imageKey].public_id;
        }

        // Update color only if provided
        if (colors[index]) {
          updatedImages[imageKey].color = colors[index];
        }
      });

      // Update the existing document
      existingImages.image1 = updatedImages.image1;
      existingImages.image2 = updatedImages.image2;
      existingImages.image3 = updatedImages.image3;

      const updatedData = await existingImages.save();
      return res.json({ data: updatedData });
    } else {
      // If no existing images, create a new record
      images.forEach((imageKey, index) => {
        if (req.files[imageKey]) {
          updatedImages[imageKey].image = req.files[imageKey][0].path;
          updatedImages[imageKey].public_id = req.files[imageKey][0].filename;
        }
      });

      const newImageData = new ImageData(updatedImages);
      await newImageData.save();
      return res.json({ data: newImageData });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const showImage = async (req, res) => {
  try {
    const savedData = await ImageData.find();

    res.json({ data: savedData[0] });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const postData = async (req, res) => {
  try {
    const {
      categoryId,
      itemId,
      firstPrize,
      firstTeam,
      secPrize,
      secTeam,
      thirdPrize,
      thirdTeam,
    } = req.body;
    console.log(req.body);
    const resultData = [];

    if (firstPrize !== undefined && firstTeam !== undefined) {
      resultData.push({ firstPrize, firstTeam });
    }
    if (secPrize !== undefined && secTeam !== undefined) {
      resultData.push({ secPrize, secTeam });
    }
    if (thirdPrize !== undefined && thirdTeam !== undefined) {
      resultData.push({ thirdPrize, thirdTeam });
    }

    const existingData = await Result.findOne({
      category: categoryId,
      item: itemId,
    });

    if (existingData) {
      existingData.result = resultData;
      await existingData.save();
      res.status(200).json({ message: "Data updated successfully" });
    } else {
      const newResult = new Result({
        category: categoryId,
        item: itemId,
        result: resultData,
      });
      await newResult.save();
      res.status(201).json({ message: "Data saved successfully" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const allResult = async (req, res) => {
  try {
    const allData = await Result.find().populate('category item');

    if (allData.length > 0) {
      res.status(200).json({ success: true, data: allData });
    } else {
      res.status(404).json({ success: false, message: "No results found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const saveTeamPoint = async (req, res) => {
  try {
    // Transform req.body into the required format
    let teamData = await TeamPoint.findOne();

    const input = req.body;

    if (!teamData) {
      teamData = new TeamPoint({ results: [] });
    }

    for (const { team, point } of input) {
      const teamObjectId = new mongoose.Types.ObjectId(team._id);
      const existingTeam = teamData.results.find((result) =>
        result.team.equals(teamObjectId)
      );
      if (existingTeam) {
        existingTeam.point = Number(point);
      } else {
        teamData.results.push({
          team: teamObjectId,
          point: Number(point),
        });
      }
    }
    const savedData = await teamData.save();

    if (savedData) {
      res.status(200).json({ message: true });
    } else {
      res.status(400).json({ message: "No changes made." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getTeamPoint = async (req, res) => {
  try {
    const data = await TeamPoint.findOne().populate("results.team"); // Retrieve the document

    if (data && data?.results) {
      // Sort the results array by the point value (convert to number for proper sorting)
      const sortedResults = data.results.sort(
        (a, b) => parseInt(b.point) - parseInt(a.point)
      );

      res.status(200).json({ data: sortedResults }); // Send sorted results
    } else {
      res.status(400).json({ message: "No data Available" });
    }
  } catch (error) {
    console.error("Error fetching team points:", error.message);
    res.status(500).json({ message: "Server error" }); // Handle server error
  }
};

module.exports = {
  startProgram,
  checkStartProgram,
  stopProgram,
  resetProgram,
  getData,
  addImage,
  postData,
  showImage,
  allResult,
  saveTeamPoint,
  getTeamPoint,
  
};
