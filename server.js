const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const PORT = 3000 || process.env.PORT;
const multer = require("./util/mutler.js");

const dataController = require("./Controller/getAndPost.js");
const brochureController = require("./Controller/addBrochure.js");
const teamController = require("./Controller/teamController.js");
const categoryController = require("./Controller/categoryController.js");
const itemController = require("./Controller/itemController.js");
const checkProgramStarted = require("./middleware/program.js");
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//middleware to parse to json
app.use(express.json());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
// app.use("/static", express.static(path.join(__dirname, "../public")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONDEND);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT,PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// app.use(cors({
//   origin: process.env.FRONDEND
// }));
app.use(cors());


app.get("/startprogram", dataController.startProgram);
app.get("/checkstatprogram", dataController.checkStartProgram);
app.get("/stopprogram", dataController.stopProgram);
app.get("/resetprogram", dataController.resetProgram);
app.get("/getresult", dataController.getData);
app.post("/imageUpload", multer.templateImagesUpload, dataController.addImage);
app.get("/showImage", dataController.showImage);
app.get("/allresult", dataController.allResult);

app.post("/saveresult", dataController.postData);
app.post("/saveteampoint", dataController.saveTeamPoint);
app.get("/teampoint", dataController.getTeamPoint);
app.post("/addbrochure");

//add brochure
app.put(
  "/addBrochure",
  multer.brochureImageUpload,
  brochureController.addBrochure
);
app.get("/getbrochuse", brochureController.getBrochuse);
app.put("/adddescription", brochureController.addDescription);
app.get("/getdescription", brochureController.getDescription);


//teams
app.post("/addteamname", teamController.addTeam);
app.get("/getteamname", teamController.getTeam);
app.delete("/deleteteam/:teamId", checkProgramStarted,teamController.deleteTeam);
app.put("/editteam",checkProgramStarted, teamController.editTeam);

//category
app.post("/addcategoryname", categoryController.addCategory);
app.delete("/deletecategoryname/:categoryId",checkProgramStarted,categoryController.deletecategory);
app.put("/editcategoryname",checkProgramStarted, categoryController.editCategoryName);
app.get("/getcategoryname", categoryController.getCategory);

//item
app.post("/additemname", itemController.addItem);
app.get("/getitemname/:categoryId", itemController.getItem);
app.put("/edititemname",checkProgramStarted, itemController.editItemName);
app.delete("/deleteitemname/:itemId",checkProgramStarted, itemController.deleteItem);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
0;
