const Result = require("../models/resultModel");
const ImageData = require("../models/imageDataModel");
// Update the image record
const fs = require("fs");
const path = require("path");

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
    const existingImages = await ImageData.findOne({});

    let updatedImages = {};

    if (existingImages) {
      // If images already exist, delete the old files if new ones are provided
      const newImages = { ...existingImages.images };

      const imageFields = ["image1", "image2", "image3"];

      imageFields.forEach((imageField) => {
        if (req.files[imageField]) {
          // Remove old image file if it exists
          if (existingImages.images[imageField]) {
            fs.unlinkSync(
              path.join(
                __dirname,
                "../public/results",
                existingImages.images[imageField]
              )
            );
          }
          // Update with new image
          newImages[imageField] = req.files[imageField][0].filename;
        }
      });

      updatedImages = newImages;
    } else {
      // If no existing images, create a new record
      updatedImages = {
        image1: req.files.image1 ? req.files.image1[0].filename : null,
        image2: req.files.image2 ? req.files.image2[0].filename : null,
        image3: req.files.image3 ? req.files.image3[0].filename : null,
      };

      const newImageData = new ImageData({ images: updatedImages });
      await newImageData.save();

      return res.json({ data: newImageData });
    }

    // If existing images were updated
    existingImages.images = updatedImages;
    const updatedData = await existingImages.save();

    res.json({ data: updatedData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const showImage = async (req, res) => {
  try {
    const savedData = await ImageData.find();

    res.json({ data: savedData[0].images });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const postData = async (req, res) => {
  try {
    const {
      resultCount,
      category,
      item,
      firstPrice,
      firstUnit,
      secPrice,
      secUnit,
      thirdPrice,
      thirdUnit,
    } = req.body;

    const newResult = new Result({
      resultCount,
      category,
      item,
      result: [],
    });

    if (firstPrice !== undefined && firstUnit !== undefined) {
      newResult.result.push({ firstPrice, firstUnit });
    }
    if (secPrice !== undefined && secUnit !== undefined) {
      newResult.result.push({ secPrice, secUnit });
    }
    if (thirdPrice !== undefined && thirdUnit !== undefined) {
      newResult.result.push({ thirdPrice, thirdUnit });
    }

    await newResult.save();

    res.status(201).json({ message: "Data saved successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getData,
  addImage,
  postData,
  showImage,
};
