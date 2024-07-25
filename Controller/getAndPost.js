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
    let colors = req.body.color.split(",");
    const existingImages = await ImageData.findOne();

    let updatedImages = {
      image1: { image: null, color: colors[0] || "light" },
      image2: { image: null, color: colors[1] || "light" },
      image3: { image: null, color: colors[2] || "light" }
    };

    const images = ["image1", "image2", "image3"];

    if (existingImages) {
      // If images already exist, delete the old files if new ones are provided
      images.forEach((imageKey, index) => {
        if (req.files[imageKey]) {
          if (existingImages[imageKey].image) {
            fs.unlinkSync(path.join(__dirname, "../public/results", existingImages[imageKey].image));
          }
          updatedImages[imageKey].image = req.files[imageKey][0].filename;
        } else {
          updatedImages[imageKey].image = existingImages[imageKey].image;
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
          updatedImages[imageKey].image = req.files[imageKey][0].filename;
        }
      });

      const newImageData = new ImageData(updatedImages);
      await newImageData.save();
      return res.json({ data: newImageData });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = addImage;

const showImage = async (req, res) => {
  try {
    const savedData = await ImageData.find();
console.log(savedData);
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
