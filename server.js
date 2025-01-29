const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const PORT =  3000||process.env.PORT;
const multer = require("./util/mutler.js");

const dataController = require("./Controller/getAndPost.js");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//middleware to parse to json
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// app.use("/static", express.static(path.join(__dirname, "../public")));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONDEND);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT,PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// app.use(cors({
//   origin: process.env.FRONDEND
// }));
app.use(cors());

app.get("/", dataController.getData);
app.post("/imageUpload", multer.productImagesUpload, dataController.addImage);
app.get("/showImage", dataController.showImage);
app.get("/allresult", dataController.allResult);

app.post("/data", dataController.postData);
app.post("/saveteampoint", dataController.saveTeamPoint);
app.get("/teampoint", dataController.getTeamPoint);

app.listen( PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
0