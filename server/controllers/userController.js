const jwt = require('jsonwebtoken');
const User=require('../models/userModel.js')
const axios = require('axios');
const Place=require('../models/placeModel.js');
const userMiddleware=require('../middleware/userMiddleware')
const placeMiddleware = require('../middleware/placeMiddleware');
const {OAuth2Client, auth}=require('google-auth-library');
const authenticationMiddleware = require('../middleware/authentication.js');
class userController{
    constructor(){

    }
    static async resetPassword(req, res) {
        try {
            const {userId}=req.token
            const user=await User.findById(userId).catch(err=>res.status(404).json({success:false,message:'no user was found'}))
            const {password}=req.body
            if(!password)
                return res.status(400).json({success:false,message:'no password was sent'})
            if(password<6)
                return res.status(400).json({success:false,message:'password should be at least 6 characters long'})
            
            user.password=password
            return res.json({success:true,message:'password was changed'})

        } catch (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: "internal server error" });
        }
      }
    static async sign_in_with_oauth(req,res){
        try{
            const code=req.query.code
            const redirectUrl='http://127.0.0.1/api/user/oauth'
            const oAuth2client=new OAuth2Client(
               process.env.CLIENT_ID,
               process.env.CLIENT_SECRET,
               redirectUrl
            )
                const res=await oAuth2client.getToken(code)
                await oAuth2client.setCredentials(res.tokens)
                console.log('tokens acquired')
                const user=oAuth2client.credentials
                console.log('credentials',user)
                await userMiddleware.get_user_data(user.access_token)

        }
        catch(error){
            console.log(error)
            return res.json({success:false,message:'internal server error'})
        }
    }
    static async createLoginUrl(req,res){
        try
        {
             const redirectUrl='http://127.0.0.1/api/user/oauth'
             const oAuth2client=new OAuth2Client(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                redirectUrl
             )
             const authorizerUrl=oAuth2client.generateAuthUrl({
                access_type:'offline',
                scope:'https://www.googleapis.com/auth/userinfo.profile openid',
                prompt:'consent'
             }   )
             res.json({url:authorizerUrl})
        }
        catch(error){
            return res,json({sucess:false,message:error.message})
        }
    }
   static async review_place(req,res){
    try{
        const {token}=req
        let {review,placeId}=req.body
        if(!review.rating||!review.review.length)
            return res.status(403).json({success:false,message:"one or both of the review fields is missing :-)"})
        let user=await User.findById(token.userId)
      
        if(!user)
            return res.status(404).json({success:false,message:'no user was found'})
        let place=await Place.findById(placeId)
        if(!place)
            return res.status(404).json({success:false,message:'no such place was found'})
        await placeMiddleware.checkIfWeekIsPassed(user,place)
            place=await placeMiddleware.add_review(place,review,token.userId)
        user=await userMiddleware.add_rated_place(place.id,user)
        review={... review,userId:{userName:user.userName}}
        return res.json({success:true,review})
    }
    catch(err){
        if(!err?.internal)
        return res.status(err.status).json({success:false,message:err.message})
    console.log(err)
    return res.status(500).json({success:false,message:'internal server error'})
    }
   }
   static async end_request(req,res){
    try{
        return res.json({success:true})
    }
    catch(err){
        console.log(err)
        return res.json({success:false,message:'internal server error'})
    }
   }
    static async sendAccount(req,res){
try{
const {user,token}=req.scope
return res.json({token,user:{userName:user.userName,email:user.email},success:true})
}
catch(err){
    console.log(err)
return res.json({message:'could not send the account',success:false})
}
    }
}
module.exports=userController