const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const PORT = 5000 || process.env.PORT;
const multer = require("./util/mutler.js");

const dataController = require("./Controller/getAndPost.js");
const brochureController = require("./Controller/addBrochure.js");
const teamController = require("./Controller/teamController.js");
const categoryController = require("./Controller/categoryController.js");
const itemController = require("./Controller/itemController.js");
const checkProgramStarted = require("./middleware/program.js");
const { saveGalleryImage, getAllImages, deleteGalleryImage, get3Images } = require("./Controller/galleryController.js");
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


app.use(cors({
  origin: process.env.FRONDEND,
  credentials: true
}));
//app.use(cors());


app.get("/api/startprogram", dataController.startProgram);
app.get("/api/checkstatprogram", dataController.checkStartProgram);
app.get("/api/stopprogram", dataController.stopProgram);
app.get("/api/resetprogram", dataController.resetProgram);
app.get("/api/getresult", dataController.getData);
app.post("/api/imageUpload", multer.templateImagesUpload, dataController.addImage);
app.get("/api/showImage", dataController.showImage);
app.get("/api/allresult", dataController.allResult);

app.post("/api/saveresult", dataController.postData);
app.post("/api/saveteampoint", dataController.saveTeamPoint);
app.get("/api/teampoint", dataController.getTeamPoint);
app.post("/api/addbrochure");

//add brochure
app.put(
  "/api/addBrochure",
  multer.brochureImageUpload,
  brochureController.addBrochure
);
app.get("/api/getbrochuse", brochureController.getBrochuse);
app.put("/api/adddescription", brochureController.addDescription);
app.get("/api/getdescription", brochureController.getDescription);


//teams
app.post("/api/addteamname", teamController.addTeam);
app.get("/api/getteamname", teamController.getTeam);
app.delete("/api/deleteteam/:teamId", checkProgramStarted,teamController.deleteTeam);
app.put("/api/editteam",checkProgramStarted, teamController.editTeam);

//category
app.post("/api/addcategoryname", categoryController.addCategory);
app.delete("/api/deletecategoryname/:categoryId",checkProgramStarted,categoryController.deletecategory);
app.put("/api/editcategoryname", categoryController.editCategoryName);
app.get("/api/getcategoryname", categoryController.getCategory);

//item
app.post("/api/additemname", itemController.addItem);
app.get("/api/getitemname/:categoryId", itemController.getItem);
app.put("/api/edititemname", itemController.editItemName);
app.delete("/api/deleteitemname/:itemId",checkProgramStarted, itemController.deleteItem);

//gallery
app.post("/api/upload-gallery", multer.galleryImagesUpload, saveGalleryImage);
app.get("/api/get-gallery", getAllImages);
app.get("/api/get3-gallery", get3Images);
app.delete("/api/delete-gallery/:id", deleteGalleryImage);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
0;
