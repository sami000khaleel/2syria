const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const nodemailer = require('nodemailer');
const User=require('../models/userModel.js')
class authenticationMiddleware{
    constructor(){

    }
    static async validateToken(req,res,next){
      try{
         const token= await jwt.verify(req.headers['token'],process.env.JWT_SECRET)
         req.token=token
         return next()
        }
      catch(error){
          console.log(error)
          res.status(500).json({success:false,message:'failed to validate token'})
      }
  }
    static async checkCodeRequestFrequency(req,res,next){
      try{
        const {user}=req.scope
        if(!user.accountVerificationCodes.length)
          return next()
        const accountVerificationCode=user.accountVerificationCodes[user.accountVerificationCodes.length-1]
        function isBefore30SecondsAgo(date) {
          // Get the current date and time
          const currentDate = new Date();
        
          // Calculate the time difference in milliseconds
          const timeDifference = currentDate - date;
        
          // Check if the time difference is less than 30 seconds (30,000 milliseconds)
          return timeDifference < 30000;
        }
          if(isBefore30SecondsAgo(accountVerificationCode.date))
           return res.json({success:false,message:'you need to wait 30 seconds between each code request'})
          return next()
          }
      catch(error){
        console.log(error)
        return res.json({success:false,message:'error during the generation of code .'})
      }
    }
    static async checkCode(req,res,next){
      try{
        let user=req.scope.user
        // this is an object
        const accountVerificationCode=user.accountVerificationCodes[user.accountVerificationCodes.length-1]
        // Function to check if a date is less than a minute ago
function isDateLessThan2MinutesAgo(date) {
  // Get the current date and time
  const currentDate = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate.getTime() - date.getTime();
  console.log(timeDifference)
  // Check if the time difference is less than 2 minute (60,000 milliseconds)
  return timeDifference < 120000;
}
  if(accountVerificationCode.checked)
  return res.json({success:false,message:'this code has been used before ...'})
console.log(req.body.verificationCode,accountVerificationCode.verificationCode)
  if(accountVerificationCode.verificationCode!=req.body.verificationCode)
  return res.json({success:false,message:'the code incorrect try again .'})
accountVerificationCode.checked=true

        return next()
      }
      catch(error){
        console.error(error)
        return res.json({success:false,message:'failed checking verification code'})
      }
    }
    // 2 step verification make app password and the user name is the same email 
    static async sendCode(req,res,next){
      try{
      const {verificationCode}=req.scope
      const transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., 'Gmail' or 'Outlook'
        auth: {
          user: process.env.USER_NAME,
          pass: process.env.APP_PASSWORD,
        },
      });
          // Create the email message
          const mailOptions = {
            from: process.env.EMAIL,
            to: req.query.email,
            subject: '2syria account recovery',
            text: `your verification code is : ${verificationCode}`,
          };
      
          // Send the email
          console.log(process.env.EMAIL,process.env.APP_PASSWORD)
          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent: ' + info.response);
      
      
      res.json({success:true})
      }
      catch(error){
        console.error(error)
        return res.json({success:false,message:'failed sending verification code'})
      }
    }
    
    static async createVerificationCode(req,res,next){
      try{
        let user=req.scope.user
        const verificationCode=Math.floor(1000000*Math.random())
       console.log(user)
        user.accountVerificationCodes.push({verificationCode})
        await user.save()
        req.scope.verificationCode=verificationCode
        return next()
      }
      catch(error){
        console.error(error)
        return res.json({success:false,message:'failed generating verification code'})
      }
    }
    static async findUserByEmail(req,res,next){
      try{
        req.scope={}
        const user=await User.findOne({email:req.body.email||req.query.email})
        if(!user)
          return res.json({success:false,message:'this email does not exist'})
        req.scope.user=user
        return next()
      }
      catch(error){
        console.error(error)
        return res.json({success:false,message:'this email does not exist'})
      }
    }
     static async   verifyPassword(req, res, next){
        try {
          const password=req.headers['password']
          if(!password)
            return res.json({success:false,message:'no password was sent'})  
          const hashedPassword = req.scope.user.password // Retrieve the hashed password from your database or any other source
      
          // Compare the entered password with the hashed password
          const isMatch = await bcrypt.compare(password, hashedPassword);
      
          if (!isMatch) {
            return res.status(401).json({ success:false,message: 'Invalid password' });
          }
      
          // Password is verified, move to the next middleware
          next();
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal server error',success:false });
        }
      };
    static async hashPassword(req, res, next) {
      try {
        const { password } = req.body;
    console.log(password)
        // Generate a salt to use for hashing
        const salt = await bcrypt.genSalt(10);
    
        // Hash the password using the generated salt
        req.body.password = await bcrypt.hash(password, salt);
        
        // Store the hashed password in a variable or database
    
        // Move to the next middleware
        next();
      } catch (err) {
        // Handle any errors that occur during hashing
        console.error(err);
        res.status(500).json({ message: 'Error hashing password',success:false });
      }
    }

    static async vaildateInforomation(req, res, next) {
        try {
          console.log(req.body)
          const { userName, password,email} = req.body;
          
          // Check if the userName and password are provided
          if (!userName || !password||!email) {
            return res.status(400).json({ message: 'userName and password and email are required',success:false });
          }
      
          // Check if the userName is already taken
          console.log('hello')
          let existingUser = await User.findOne({ userName });
          if (existingUser?.id) {
            return res.status(400).json({ message: 'userName is already taken',success:false });
          }
          existingUser = await User.findOne({ email });
          if (existingUser?.id) {
            return res.status(400).json({ message: 'email is already taken',success:false });
          }
          
          // Perform additional validation or checks if needed
          
          // If all validation passes, move to the next middleware
          req.scope={password,userName}
          next();
        } catch (err) {
          // Handle any errors that occur during validation
          console.log(err);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
      static async createToken(req, res, next) {
        try {
          const { user } = req.scope;
      
          // Generate a JWT token containing the user ID
          const token = jwt.sign({ userId: user.id },process.env.JWT_SECRET);
      
          // Attach the token to the response or store it as needed
          req.scope.token = token;
      
          // Move to the next middleware
          next();
        } catch (err) {
          // Handle any errors that occur during token generation
          console.error(err);
          res.status(500).json({ message: 'Failed to generate token',success:false });
        }
      }
}
module.exports=authenticationMiddleware