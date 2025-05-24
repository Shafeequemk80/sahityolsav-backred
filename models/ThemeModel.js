const mongoose = require("mongoose");

const addDescriptionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
});

const addDescriptionModel = mongoose.model("Description", addDescriptionSchema);

module.exports =   addDescriptionModel

