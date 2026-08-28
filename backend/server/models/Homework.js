import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
{
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

    formUrl:{
        type:String,
        required:true
    },

    dueDate:{
        type:Date,
        default:null
    }

},
{
    timestamps:true
});

export default mongoose.model("Homework",homeworkSchema);