const express = require('express');
const auth=require('../middleware/authentication')
const placeController = require('../controllers/placeController');
const authenticationMiddleware = require('../middleware/authentication');
const router=express.Router()
router.get('/image',placeController.getImage)
router.get('/get-place-photo',placeController.get_photo);
router.get('/fetch-places-nearby',auth.validateToken,placeController.get_places)
router.get('/search-places',placeController.findPlaces) 
router.post('/search-by-image',authenticationMiddleware.validateToken,placeController.searchByImage) 
module.exports=router