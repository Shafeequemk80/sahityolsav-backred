const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors =require('cors')
const PORT = 3000;
const Result = require("./resultModel");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//middleware to parse to json
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.get("/",async (req, res) => {
    try {
        const{category,item}=req.query
        console.log(req.query);
    const resultData=  await Result.findOne({category:category,item:item})
console.log(resultData,'data');
    res.status(201).json({
       data:  resultData,
      });
    } catch (error) {
      console.log(error.message);
      // Handle errors if any occur during saving
      res.status(400).json({ message: error.message });
    }
});

app.get("/admin", (req, res) => {
  res.json({ message: "welcome to admin" });
});

app.post("/data", async (req, res) => {
  try {
    console.log(req.body);
    // Extract data from the request body
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
    
   
    // Create a new instance of your Mongoose model
   // Create a new instance of Result
   const newResult = new Result({
    resultCount: resultCount,
    category: category,
    item:item,
    result: [] // Define an empty array initially
  });
  
  // Later, populate the result array
  newResult.result.push({
    firstPrice: firstPrice,
    firstUnit: firstUnit
  });
  
  newResult.result.push({
    secPrice: secPrice,
    secUnit: secUnit
  });
  
  newResult.result.push({
    thirdPrice: thirdPrice,
    thirdUnit: thirdUnit
  });
  
// Save the new result to the database
const success=newResult.save()

    // Respond with a JSON message and the received data
    res.status(201).json({
      message: true
    });
  } catch (error) {
    console.log(error.message);
    // Handle errors if any occur during saving
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
