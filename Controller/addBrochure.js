const Brochure = require("../models/Brochure");
const Description = require("../models/ThemeModel");

const addBrochure = async (req, res) => {
  try {
    const brochureData = await Brochure.findOne();
    const brochures = ["image1", "image2", "image3"];
    if (brochureData) {
      for (const field of brochures) {
        if (req.files[field]) {
          const newImage = req.files[field][0];

          //detele previoes image
          const existingImage = brochureData[field];
          if (existingImage && existingImage.public_id) {
            try {
              await cloudinary.uploader.destroy(existingImage.public_id);
            } catch (error) {
              console.error("error brochure deleting", error);
            }
          }
          //update image
          brochureData[field] = {
            path: newImage.path,
            public_id: newImage.filename,
          };
        }
      }
      await brochureData.save();
      return res.status(200).json({ message: "Brochure updated successfully" });
    } else {
      const newBrochure = {};
      for (const field of brochures) {
        if (req.files[field]) {
          const file = req.files[field][0];
          newBrochure[field] = {
            path: file.path,
            public_id: file.filename,
          };
        }
      }

      const saveBrochure = new Brochure(newBrochure);
      await saveBrochure.save();
      return res.status(201).json({ message: "Brochuse created successfully" });
    }
  } catch (error) {
    console.log("error in brochure", error.message);
    res.status(500).json({ message: "server error" });
  }
};

const getBrochuse = async (req, res) => {
  try {
    const getBrochuse = await Brochure.findOne();
    return res.status(200).json({ message :'data feted successfully',data: getBrochuse });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message:'server error'})
  }
};

const addDescription = async (req, res) => {
  try {
    const {description } = req.body;
    let descriptionData= await Description.findOne()

    if(descriptionData) {
        descriptionData.description= description
        await descriptionData.save()
    }else{
     descriptionData= new Description({description})
      await descriptionData.save()
    }
    res.status(200).json({message:"description added successfully",data:descriptionData.description})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message:'Server Error'})
  }
};
const getDescription = async (req, res) => {
    try {
      const descriptionData = await Description.findOne();
      return res.status(200).json({ message:'Description data fethed successfully',data: descriptionData.description });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message:'server error' });

    
    }
  };


module.exports = {
  addBrochure,
  getBrochuse,
  addDescription,
  getDescription
};
