const mongoose = require("mongoose");

const addDescriptionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    default:'add Theme of the fest'
  },
   title: {
    type: String,
    required: true,
  },
});

const addDescriptionModel = mongoose.model("Description", addDescriptionSchema);

module.exports =   addDescriptionModel

