const User=require('../models/userModel.js')
const axios = require('axios');
class userMiddleware{
    constructor(){

    }
  static async add_rated_place(placeId, user) {
      try {
          // Create a new rated place entry
          const ratedPlace = {
              date: new Date(),
              place: placeId
          };
  
          // Push the rated place into the placesReviewed array of the user
          user.placesReviewed.push(ratedPlace);
  
          // Save the updated user document
          const updatedUser = await user.save();
  
          return updatedUser;
      } catch (error) {
          throw error;
      }
  }
  static async get_user_data(access_token) {
      try {
        const {data}=await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`)
        console.log('data',data)    
    } catch (error) {
          throw error;
      }
  }
  
    static async findUser(req,res,next){
        try{
            req.scope={}
            let user
            if(req.query.userName)
                user=await User.findOne({userName:req.query.userName})
            else if(req.params.userId)    
            user=await User.findById(req.params.userId)
            else if(req.token.userId)
            user=await User.findById(req.token.userId)
            if(!user)
                return res.status(400).json({message:'user was not found',success:false})
                req.scope.user=user
                return next()
            }
        catch(err){
            console.error(err)
            return res.status(500).json({message:'internal server error',success:false})
        }
    }
    static async createAccount(req, res,next) {
        try {
          const { userName, password ,email} = req.body;
      
          // Check if the userName and password are provided
          if (!userName || !password) {
            return res.status(400).json({ message: 'userName and password are required',success:false });
          }
      
      
          // Create a new user account
          const newUser = new User({ userName, password,email });
      
          // Save the user account to the database
          await newUser.save();
          req.scope.user=newUser
          // Return a success response
          return next()
        } catch (err) {
          // Handle any errors that occur during account creation
          console.error(err);
          return res.status(500).json({ message: 'Failed to create account' });
        }
      }

}
module.exports=userMiddleware