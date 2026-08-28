import Class from "../models/Class.js";



// إضافة صف
export const addClass = async(req,res)=>{

try{


const newClass = await Class.create({

name:req.body.name,

gradeLevel:req.body.gradeLevel

});


res.status(201).json({

success:true,

class:newClass

});


}catch(error){

console.log(error);

res.status(500).json({

message:"Server Error"

});

}

};




// جلب كل الصفوف

export const getClasses = async(req,res)=>{


try{


const classes = await Class.find();


res.json(classes);



}catch(error){


console.log(error);


res.status(500).json({

message:"Server Error"

});


}


};