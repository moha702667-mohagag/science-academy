import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

// ======================================
// تحديث مجموع درجات الامتحان
// ======================================

const updateExamMarks = async (examId) => {

  const questions = await Question.find({
    examId
  });


  const totalMarks = questions.reduce(
    (sum, q) => sum + Number(q.marks || 0),
    0
  );


  await Exam.findByIdAndUpdate(
    examId,
    {
      totalMarks
    }
  );

};




// ======================================
// إضافة سؤال
// ======================================

export const createQuestion = async (req,res)=>{

try{


let {
  examId,
  type,
  question,
  image,
  options,
  correctAnswers,
  marks,
  explanation,
  order
} = req.body;

// لأن FormData بيبعتهم كنص
if(typeof options === "string"){
options = JSON.parse(options);
}

if(typeof correctAnswers === "string"){
correctAnswers = JSON.parse(correctAnswers);
}



// التأكد من وجود الامتحان

const exam = await Exam.findById(examId);


if(!exam){

return res.status(404).json({

success:false,

message:"Exam not found"

});

}



// معالجة الصح والخطأ

if(type === "trueFalse"){


options = [

{
text:"صح"
},

{
text:"خطأ"
}

];


}


/// معالجة الاختيارات

options = options || [];


options = options.map((option,index)=>({

  optionId:index,

  text:option.text

}));




const newQuestion = await Question.create({

examId,

type,

question,

image: image || "",

options,

correctAnswers,

marks:Number(marks) || 1,

explanation:explanation || "",

order:order || 0

});




// تحديث درجات الامتحان

await updateExamMarks(examId);





res.status(201).json({

success:true,

question:newQuestion

});



}catch(error){


console.log(
"CREATE QUESTION ERROR:",
error.message
);



res.status(500).json({

success:false,

message:error.message

});


}


};









// ======================================
// جلب الأسئلة
// ======================================


export const getQuestions = async(req,res)=>{

try{


const questions = await Question.find({

examId:req.params.examId

})
.sort({

order:1

});



res.json({

success:true,

questions

});



}catch(error){


console.log(
"GET QUESTIONS ERROR:",
error.message
);



res.status(500).json({

success:false,

message:error.message

});


}


};









// ======================================
// تعديل سؤال
// ======================================


export const updateQuestion = async(req,res)=>{

try{


const question = await Question.findByIdAndUpdate(

req.params.id,

req.body,

{

new:true,

runValidators:true

}

);



if(!question){

return res.status(404).json({

success:false,

message:"Question not found"

});

}




await updateExamMarks(
question.examId
);



res.json({

success:true,

question

});



}catch(error){


console.log(
"UPDATE QUESTION ERROR:",
error.message
);



res.status(500).json({

success:false,

message:error.message

});


}

};









// ======================================
// حذف سؤال
// ======================================


export const deleteQuestion = async(req,res)=>{


try{


const question = await Question.findByIdAndDelete(

req.params.id

);



if(!question){


return res.status(404).json({

success:false,

message:"Question not found"

});


}





await updateExamMarks(

question.examId

);




res.json({

success:true,

message:"Question deleted"

});



}catch(error){


console.log(
"DELETE QUESTION ERROR:",
error.message
);



res.status(500).json({

success:false,

message:error.message

});


}


};