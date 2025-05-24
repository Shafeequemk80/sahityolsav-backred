const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  item: {
        type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  result: [],
});

const Result = mongoose.model("Result", ResultSchema);
module.exports = Result;
