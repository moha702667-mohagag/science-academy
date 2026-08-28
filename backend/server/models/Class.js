import mongoose from "mongoose";

const classSchema = new mongoose.Schema({

name:{
    type:String,
    required:true
},

title:{
    type:String,
    required:true
},

description:{
    type:String,
    default:""
},

gradeLevel:{
    type:String,
    required:true
},

},{
timestamps:true
});


export default mongoose.model("Class",classSchema);