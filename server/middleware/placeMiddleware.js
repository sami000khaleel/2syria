const Place = require("../models/placeModel.js");
const FormData = require("form-data");
const fs = require('fs');
const path = require('path');
const axios = require('axios');
class placeMiddleware {
  constructor() {}
  static async matchPlacesByImagesNames(similarities) {
    let places = [];
  
    for (let similarity of similarities) {
      const photoReference = similarity[0].split('.jpg')[0];
      let place = await Place.findOne({
        'photos.photo_reference': photoReference,
      });
      places.push({ place, probability: similarity[1] });
    }
  places=places.filter(el=>el?.place?.id?true:false)
  places = places.map((element) => ({
      _id: element.place.id,
      name: element.place.name,
      location: element.place.location,
      photos: element.place.photos,
      reviews: element.place.reviews,
      place_id: element.place.place_id,
      description: element.place.description,
      type: element.place.type,
      city: element.place.city,
      avgRating: element.place.avgRating,
      probability:element.probability
    }));
    console.log(places.length)
    return places;
  }
  static async sendImage(filePath, res) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log('file does not exist');
        throw new Error('File does not exist');
      }
  
      if (fs.existsSync(path.join(filePath))) {
        console.log('file does exist');
      }
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      console.log({ ...formData.getHeaders() });
  
      const response = await axios.post(process.env.SIMILARITY_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.SERVER_TOKEN}`,
        },
      });
  
      console.log(process.env.SIMILARITY_URL);
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      return res.status(500).json({ success: false, message: 'Error communicating with the server' });
    }
  }
  
    static async  checkIfWeekIsPassed(user, place) {
  console.log(place.reviews)
  const lastReview = place.reviews.find(review => review.userId.toString() === user._id.toString());
  
  if (lastReview) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    console.log(oneWeekAgo,lastReview.data)
    if (lastReview.date >= oneWeekAgo) {
      // User has reviewed the place within the past week
      const err= new Error("you have commented once at this place within a week !")
      err.internal=false
      err.status=403
      throw err
    }
    return true;
  }
  

}
static async add_review(place, review, userId) {
    try {
        // Create a new review object
        const newReview = {
            userId: userId,
            rating: review.rating,
            review: review.review
        };

        // Push the new review to the place's reviews array
        place.reviews.push(newReview);

        // Calculate the new average rating for the place
        let totalRating = 0;
        for (let review of place.reviews) {
            totalRating += review.rating;
        }
        place.avgRating = totalRating / place.reviews.length;

        // Save the updated place
        const updatedPlace = await place.save();

        return updatedPlace;
    } catch (error) {
        throw error;
    }
}

  static calculate_distance(userLat, userLng, placeLat, placeLng) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }
    //Haversine Formula
//     وظيفة حساب المسافة (calculate_distance)

// هذه الوظيفة تأخذ أربعة مدخلات:

// userLat: خط عرض المستخدم (بالدرجات)
// userLng: خط طول المستخدم (بالدرجات)
// placeLat: خط عرض المكان (بالدرجات)
// placeLng: خط طول المكان (بالدرجات)
// وتقوم الوظيفة بحساب المسافة بين المستخدم والمكان بالكيلومترات.

// خطوات حساب المسافة:

// تحويل الزوايا من الدرجات إلى راديان (deg2rad):

// تحتوي هذه الوظيفة الفرعية على مهمة deg2rad تقوم بتحويل قيمة الزاوية المُدخلّة بالدرجات إلى قيمتها المكافئة بالراديان.
// يتم التحويل عن طريق ضرب قيمة الزاوية بالثابت Math.PI (パイ / 180).
// حساب الفرق بين خطوط العرض والطول:

// يتم حساب الفرق بين خط عرض المستخدم وخط عرض المكان وتخزينه في المتغير latDiff.
// يتم حساب الفرق بين خط طول المستخدم وخط طول المكان وتخزينه في المتغير lngDiff.
// بعد ذلك يتم تحويل قيمتي latDiff و lngDiff إلى راديان باستخدام وظيفة deg2rad.
// حساب جزء من المعادلة لحساب المسافة (a):

// يتم استخدام الدوال الرياضية Math.sin و Math.cos لحساب قيمة a.
// تتضمن هذه الحسابات قيم خطوط العرض والطول للمستخدم والمكان بعد تحويلها إلى راديان.
// حساب المسافة (c):

// يتم حساب قيمة c باستخدام الدالة Math.atan2.
// تأخذ هذه الدالة جذرين تربيعيين، الأول لحساب a والجذر الثاني للواحد ناقص a.
// تمثل قيمة c الزاوية المركزية للكرة الأرضية التي تشكل القوس بين المستخدم والمكان.
// حساب المسافة النهائية:

// يتم ضرب قيمة نصف قطر الأرض (المخزنة بالمتغير earthRadiusKm والبالغة 6371 كيلومتر) بقيمة c لحساب المسافة النهائية بالكيلومترات.
// إرجاع المسافة:

// تقوم الوظيفة بإرجاع قيمة المسافة المحسوبة بين المستخدم والمكان بالكيلومترات.
// ملخص:

// تقوم هذه الوظيفة باستخدام معادلة حساب المسافة على سطح كروي (مثل الأرض) لتحديد المسافة بين المستخدم والمكان بناءً على خطوط العرض والطول الخاصة بهم.



    const earthRadiusKm = 6371;

    const latDiff = deg2rad(placeLat - userLat);
    const lngDiff = deg2rad(placeLng - userLng);

    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(deg2rad(userLat)) *
        Math.cos(deg2rad(placeLat)) *
        Math.sin(lngDiff / 2) *
        Math.sin(lngDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return distance;
  }

  static filter_places_by_radius(userLat, userLng, unit, places, radius) {
    const filteredPlaces = places.filter((place) => {
      const distance = placeMiddleware.calculate_distance(
        userLat,
        userLng,
        place.location.lat,
        place.location.lng
      );

      if (unit === "km" && distance <= radius) {
        return true;
      } else if (unit === "mi" && distance <= radius * 0.621371) {
        return true;
      } else {
        return false;
      }
    });

    return filteredPlaces;
  }
  static async getPlace(placeId){
    
    const place =await Place.findById(placeId)
    if(!place)
      throw new Error('no such place exists')
    return place
  }
}

module.exports = placeMiddleware;
