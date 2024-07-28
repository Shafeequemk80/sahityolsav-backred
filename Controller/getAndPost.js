const Result = require("../models/resultModel");
const ImageData = require("../models/imageDataModel");
// Update the image record
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const getData = async (req, res) => {
  try {
    const { category, item } = req.query;

    const resultData = await Result.findOne({ category, item });

    res.status(200).json({
      data: resultData || false,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
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
                } else {
                  console.log("Image deleted successfully:", result);
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
          updatedImages[imageKey].image = req.files[imageKey][0].oath;
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
    
      category,
      item,
      firstPrice,
      firstUnit,
      secPrice,
      secUnit,
      thirdPrice,
      thirdUnit,
    } = req.body;

    const resultData = [];

    if (firstPrice !== undefined && firstUnit !== undefined) {
      resultData.push({ firstPrice,  firstUnit });
    }
    if (secPrice !== undefined && secUnit !== undefined) {
      resultData.push({secPrice, secUnit });
    }
    if (thirdPrice !== undefined && thirdUnit !== undefined) {
      resultData.push({ thirdPrice,  thirdUnit });
    }

    const existingData = await Result.findOne({ category, item });

    if (existingData) {
  
      existingData.result = resultData;
      await existingData.save();
      res.status(200).json({ message: "Data updated successfully" });
    } else {
      const newResult = new Result({
        category,
        item,
        result: resultData,
      });
      await newResult.save();
      res.status(201).json({ message: "Data saved successfully" });
    }
  } catch (error) {
    console.log( error.message)
    res.status(400).json({ message: error.message });
  }
};



module.exports = {
  getData,
  addImage,
  postData,
  showImage,
};
