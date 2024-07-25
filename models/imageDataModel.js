const mongoose = require("mongoose");

const ImageDataSchema = new mongoose.Schema({
  images: {
    image1: { type: String},
    image2: { type: String },
    image3: { type: String },
  },
});

const ImageData = mongoose.model("ImageData", ImageDataSchema);

module.exports = ImageData;
