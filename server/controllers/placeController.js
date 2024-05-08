const Place = require("../models/placeModel.js");
const path = require("path");
const fs = require('fs');
const multer = require("multer");
const auth=require('../middleware/authentication.js')
const axios = require("axios");
const placeMiddleware = require("../middleware/placeMiddleware.js");
class placeController {
  constructor() {}

  static async searchByImage(req, res) {
    try {
      
      const uploadDir = path.join(__dirname, "..", "uploads");

      // Check if the uploads directory exists, create it if it doesn't
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, uploadDir); // Destination folder for uploaded files
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + path.extname(file.originalname)); // Rename files to avoid collisions
        },
      });

      const upload = multer({ storage }).single("file");

      upload(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err.message);
          throw new Error('error handling the image')
        }
          if(!req?.file?.path)
              return res.status(400).json({message:'file was no sent',success:false})
        // File is uploaded, you can access it via req.file
        const filePath = req.file.path;
        console.log("File saved at:", filePath);
        let similarities = await placeMiddleware.sendImage(filePath, res);
        if(!similarities.length)
          return res.status(500).json({success:false,message:'no similarities were found'})

        const results = await placeMiddleware.matchPlacesByImagesNames(similarities);
        console.log(results.length);
        const uniqueResults = {};
        const finalResult = results.filter((place) => {
          if (!uniqueResults[place._id]) {
            uniqueResults[place._id] = { ...place };
            return true;
          }
        });
        console.log(finalResult.length);
        return res.status(200).json({ success: true, places: finalResult });
      })}
       catch (err) {
      console.log(err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static async getReviews(req, res) {
    try {
      const { placeId } = req.query;
      // console.log(placeId)
      let place = await Place.findById(placeId).populate(
        "reviews.userId",
        "userName"
      ); // Populate user names from reviews

      const reviews = place.reviews.map((review) => review);
      // console.log(place)

      if (!place)
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      return res.status(200).json({ success: true, reviews });
    } catch (err) {
      // console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "internal server error" });
    }
  }
  static async getImage(req, res) {
    try {
      const { photoReference, placeId } = req.query;
      if (!photoReference || !placeId) throw new Error("params are messing");
      const imagePath = path.join(
        process.cwd(),
        "data",
        "images",
        placeId,
        `${photoReference}.jpg`
      );
      return res.sendFile(imagePath);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "internal server error", success: false });
    }
  }
  static async findPlaces(req, res) {
    try {
      console.log(req.query)
        if(!req.query?.cities&&!req.query?.types&&!req.query?.search&&req.query?.radius==='undefined'&&req.query?.userLat=='undefined'&&req.query?.userLng==='undefined'&&req.query?.unit==='undefined')  
        return res.status(400).json({success:false,message:'please specify what you are looking for'})
      const { userLat, userLng, unit } = req.query;
      const radius = Number(req.query.radius);
      const searchQuery = req.query.search;

      let regex;
      if (searchQuery) regex = new RegExp(escapeRegex(searchQuery), "gi");

      let results = [];
      let query = {};

      if (req.query.cities && req.query.cities.length > 0) {
        const cities = req.query.cities.split(",");
        query.city = { $in: cities };
      }

      if (req.query.types && req.query.types.length > 0) {
        const types = req.query.types.split(",");
        query.type = { $in: types };
      }

      // Include the search query conditions if it exists
      if (searchQuery) {
        query.$or = [
          { name: regex },
          { name: { $regex: regex } },
          { name: { $regex: searchQuery } },
        ];
      }
      console.log(query);
      // Perform the search using the constructed query
      results = await Place.find(query);
      // Filter out duplicate places
      console.log(results.length);
      const uniqueResults = {};
      results.forEach((place) => {
        if (!uniqueResults[place._id]) {
          uniqueResults[place._id] = place;
        }
      });

      // Convert the uniqueResults object back to an array
      // results = Object.values(uniqueResults);
      if(userLat&&userLng&&unit&&radius)
      {
          results=placeMiddleware.filter_places_by_radius(userLat,userLng,unit,results,radius)
      }
      if (!results.length)
        return res
          .status(404)
          .json({ success: false, message: "no palces were found" });
      res.json({ success: true, length: results.length, results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message, success: false });
    }

    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
  }
  static async get_places(req, res) {
    try {
      const { radius, unit, userLng, userLat, type, city } = req.query;
      let query = {};
      if (type) query = { ...query, type };
      if (city) query = { ...query, city };
      if (!radius)
        return res.json({ success: false, message: "radius was not given" });
      if (unit != "mi" && unit != "km")
        return res.json({
          success: false,
          message: "not a supported unit or format",
        });
      let places = await Place.find(query);

      if (!places.length)
        return res.json({
          success: false,
          message: "no places were found try another query",
        });
      const filtered_places = placeMiddleware.filter_places_by_radius(
        userLat,
        userLng,
        unit,
        places,
        radius
      );
      if (!filtered_places.length)
        return res.json({
          success: false,
          message: "no places were found try another query",
        });
      console.log(filtered_places.length);
      return res.json({
        success: true,
        total: filtered_places.length,
        places: filtered_places,
      });
    } catch (error) {
      console.log(error);
      return res.json({ success: false, message: error.message });
    }
  }
  static async get_photo(req, res) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${req.query.photoReference}&key=${process.env.KEY}`;
      res.redirect(url);
    } catch (err) {
      console.log(err);
      return res.json({ success: false, message: "internal server error" });
    }
  }
}
module.exports = placeController;
