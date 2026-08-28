import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({

teacherId:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"User",
 required:true
},

title:{
 type:String,
 required:true
},

classId:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"Class",
 required:true
},

description:{
 type:String,
 default:""
},

videoUrl:{
 type:String,
 default:""
},

createdAt:{
 type:Date,
 default:Date.now
}

});


export default mongoose.model(
"Course",
courseSchema
);