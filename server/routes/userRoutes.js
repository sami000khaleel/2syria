const userController=require('../controllers/userController.js')
const userMiddleware=require('../middleware/userMiddleware.js')
const authenticationMiddleware=require('../middleware/authentication.js')
const express = require('express');
const { auth } = require('google-auth-library');
const placeController = require('../controllers/placeController.js');
const router=express.Router()
router.get('/send-account',authenticationMiddleware.validateToken,userMiddleware.findUser,userController.sendAccount)
router.get('/validate-token',authenticationMiddleware.validateToken,userController.end_request)
router.post('/signup',authenticationMiddleware.vaildateInforomation,authenticationMiddleware.hashPassword,userMiddleware.createAccount,authenticationMiddleware.createToken,userController.sendAccount)
router.get('/login',userMiddleware.findUser,authenticationMiddleware.verifyPassword,authenticationMiddleware.createToken,userController.sendAccount)
router.get('/recover-account',authenticationMiddleware.findUserByEmail,authenticationMiddleware.checkCodeRequestFrequency,authenticationMiddleware.createVerificationCode,authenticationMiddleware.sendCode)
router.post('/recover-account',authenticationMiddleware.findUserByEmail,authenticationMiddleware.checkCode,authenticationMiddleware.createToken,userController.sendAccount)
router.post('/review-place',authenticationMiddleware.validateToken,userController.review_place)
router.get('/get-reviews',authenticationMiddleware.validateToken,placeController.getReviews)
router.patch('/reset-password',authenticationMiddleware.validateToken,authenticationMiddleware.hashPassword,userController.resetPassword)
module.exports=router