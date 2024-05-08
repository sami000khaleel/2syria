const mongoose=require('mongoose')
const placeSchema=new mongoose.Schema({
    city:String,
    place_id:{type:String,required:true},
    name:{type:String,required:true},
    photos:[mongoose.Schema.Types.Mixed],
    photosUrl:[String],
    location:{
        lng:{type:Number,required:true},
        lat:{type:Number,required:true}
    },
    avgRating:{type:Number,required:true,default:0},
    reviews:[{
        date:{
            type:Date,
            default: Date.now,
            required:true
        }
        ,
        userId:{required:true,type:mongoose.SchemaTypes.ObjectId,ref:'User'},

        rating:{
            type:Number,
            min:0,
            max:5
        },
        review:String
    }],
    description:String,
    type:{type:String,required:true}
})
module.exports=mongoose.model('Place',placeSchema)