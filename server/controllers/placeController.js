const Place = require("../models/placeModel.js");
const path = require("path");
const auth=require('../middleware/authentication.js')
const axios = require("axios");
const placeMiddleware = require("../middleware/placeMiddleware.js");
const r2 = require("../utils/r2.js");
class placeController {
  constructor() {}

  static async searchByImage(req, res) {
    try {
      // Keep the upload in memory only — nothing is written to disk.
      // It is forwarded straight to the AI service.
      try {
        await placeMiddleware.receiveImageInMemory(req, res);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: err.message || "could not read the image" });
      }
      if (!req.file?.buffer?.length)
        return res.status(400).json({ message: "file was no sent", success: false });

      let similarities;
      try {
        similarities = await placeMiddleware.sendImage(req.file);
      } catch (err) {
        if (err.aiUnavailable) {
          console.log("AI service unavailable:", err.message);
          return res.status(503).json({
            success: false,
            message: "the AI image search service is not available right now, please try again later",
          });
        }
        if (err.aiRejected)
          return res.status(400).json({ success: false, message: err.message });
        throw err;
      }

      if (!similarities?.length)
        return res
          .status(404)
          .json({ success: false, message: "no similar places were found for this image" });

      const results = await placeMiddleware.matchPlacesByImagesNames(similarities);
      const uniqueResults = {};
      const finalResult = results.filter((place) => {
        if (!uniqueResults[place._id]) {
          uniqueResults[place._id] = { ...place };
          return true;
        }
      });
      if (!finalResult.length)
        return res
          .status(404)
          .json({ success: false, message: "no similar places were found for this image" });
      return res.status(200).json({ success: true, places: finalResult });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ success: false, message: "internal server error" });
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
      // only plain ids — never let "../" reach the file system or the bucket key
      const safe = /^[A-Za-z0-9_-]+$/;
      if (!safe.test(photoReference || "") || !safe.test(placeId || ""))
        return res.status(400).json({ success: false, message: "invalid image params" });

      // Production: the server reads the photo from the (private) R2 bucket
      // and streams it to the browser. The browser never talks to R2.
      if (r2.isConfigured()) {
        let object;
        try {
          object = await r2.getObject(
            `places/${placeId}/${photoReference}.jpg`,
            req.get("If-None-Match")
          );
        } catch (err) {
          if (err.status === 404)
            return res.status(404).json({ success: false, message: "image not found" });
          throw err;
        }
        res.set("Cache-Control", "public, max-age=604800"); // browser keeps it for 7 days
        if (object.notModified) return res.status(304).end();
        res.set("Content-Type", object.contentType || "image/jpeg");
        if (object.contentLength) res.set("Content-Length", String(object.contentLength));
        if (object.etag) res.set("ETag", object.etag);
        if (object.lastModified) res.set("Last-Modified", new Date(object.lastModified).toUTCString());
        object.body.on("error", (err) => {
          console.log("R2 stream error:", err.message);
          res.destroy(err);
        });
        return object.body.pipe(res);
      }

      // Local development: serve from data/images
      const imagePath = path.join(__dirname, "..", "data", "images", placeId, `${photoReference}.jpg`);
      return res.sendFile(imagePath, (err) => {
        if (err && !res.headersSent)
          res.status(404).json({ success: false, message: "image not found" });
      });
    } catch (err) {
      console.log(err);
      if (res.headersSent) return res.end();
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
      const { radius, unit, userLng, userLat  } = req.query;
      if (!radius)
        return res.json({ success: false, message: "radius was not given" });
      if (unit != "mi" && unit != "km")
        return res.json({
          success: false,
          message: "not a supported unit or format",
        });
      let places = await Place.find();

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
