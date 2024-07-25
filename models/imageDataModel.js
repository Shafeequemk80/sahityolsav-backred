const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  image: { type: String, default: "defaultImage.jpg" },
  color: { type: String, default: "light" }
});

const ImageDataSchema = new mongoose.Schema({
  image1: ImageSchema,
  image2: ImageSchema,
  image3: ImageSchema
});

const ImageData = mongoose.model("ImageData", ImageDataSchema);

module.exports = ImageData;
