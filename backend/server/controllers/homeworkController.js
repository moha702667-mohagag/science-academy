import Homework from "../models/Homework.js";
import Class from "../models/Class.js";



// إضافة واجب

export const addHomework = async(req,res)=>{


try{


const homework = await Homework.create({

teacherId:req.user.id,

title:req.body.title,

classId:req.body.classId,

description:req.body.description,

formUrl : req.body.formUrl,

dueDate:req.body.dueDate


});



res.status(201).json({

success:true,

homework

});



}catch(error){


console.log(error);


res.status(500).json({

message:"Server Error"

});


}


};







// جلب واجبات المدرس

export const getHomeworks = async(req,res)=>{
try{

const homeworks = await Homework.find({
 teacherId:req.user.id
})
.populate("classId");

res.json(homeworks);

}catch(error){

console.log(error);

res.status(500).json({

message:"Server Error"

});
}
};

// حذف واجب

export const deleteHomework = async(req,res)=>{

try{


const homework = await Homework.findOneAndDelete({

_id:req.params.id,

teacherId:req.user.id

});


if(!homework){

return res.status(404).json({

message:"Homework not found"

});

}



res.json({

success:true,

message:"Homework deleted"

});


}catch(error){


console.log(error);


res.status(500).json({

message:"Server Error"

});


}

};
// تعديل واجب

export const updateHomework = async(req,res)=>{


try{


const homework =
await Homework.findOneAndUpdate(

{

_id:req.params.id,

teacherId:req.user.id

},

req.body,

{
new:true
}

);



res.json({

success:true,

homework

});



}catch(error){


console.log(error);


res.status(500).json({

message:"Server Error"

});


}

};

// جلب الواجب لطلاب

// جلب واجبات الطالب حسب الصف الدراسي

export const getStudentHomeworks = async(req,res)=>{

try{


const gradeName = req.user.grade;


// تحويل اسم الصف لرقم

const gradeMap = {

  "الرابع الابتدائي": 4,
  "الخامس الابتدائي": 5,
  "السادس الابتدائي": 6,

  "الأول الإعدادي": 7,
  "الثاني الإعدادي": 8,
  "الثالث الإعدادي": 9,

  "الأول الثانوي": 10,

};



const gradeNumber = gradeMap[gradeName];


// نجيب الكلاس

const allClasses = await Class.find();



const classData = allClasses.find(

item => String(item.gradeLevel) === String(gradeNumber)

);

if(!classData){


return res.json({

success:true,

homeworks:[]

});


}





// جلب الواجبات الخاصة بالكلاس

const homeworks = await Homework.find({

classId:classData._id

})
.populate("classId")
.sort({
createdAt:-1
});




res.status(200).json({

success:true,

homeworks

});





}catch(error){


console.log(error);


res.status(500).json({

success:false,

message:"Server Error"

});


}


};