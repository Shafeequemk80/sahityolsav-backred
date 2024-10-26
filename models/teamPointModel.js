const mongoose = require("mongoose");

const TeamPointSchema = new mongoose.Schema({
    results: [ 
      {
       team:{
        type:String,
       },
       point:{
        type:String
       }
      }
    ],
  });
  
  const TeamPoint = mongoose.model("TeamPoint", TeamPointSchema);
  module.exports = TeamPoint;