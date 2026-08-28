import cloudinary from "../config/cloudinary.js";

export const uploadImage = async(req,res)=>{

try{

if(!req.file){

return res.status(400).json({

success:false,

message:"No file"

});

}

const result = await new Promise((resolve,reject)=>{

const stream = cloudinary.uploader.upload_stream(

{

folder:"science-academy/questions"

},

(error,result)=>{

if(error) reject(error);

else resolve(result);

}

);

stream.end(req.file.buffer);

});

res.json({

success:true,

image:result.secure_url

});

}catch(error){

console.log(error);

res.status(500).json({

success:false,

message:"Upload Error"

});

}

};