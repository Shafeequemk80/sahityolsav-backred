const mongoose = require("mongoose");

const addTeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
});

const addTeamModel = new mongoose.model("addTeamModel", addTeamSchema);
module.exports = addTeamModel;
