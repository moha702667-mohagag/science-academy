import Course from "../models/Course.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

// إضافة كورس
export const addCourse = async(req,res)=>{

try{


const course = await Course.create({

teacherId:req.user.id,

title:req.body.title,

classId:req.body.classId,

description:req.body.description,

videoUrl:req.body.videoUrl

});


res.status(201).json({

success:true,

course

});


}catch(error){

console.log(error);

res.status(500).json({

message:"Server Error"

});


}

};





// جلب كورسات المدرس

export const getCourses = async(req,res)=>{


try{


const courses = await Course.find({

teacherId:req.user.id

})
.populate("classId");



res.json(courses);



}catch(error){


console.log(error);


res.status(500).json({

message:"Server Error"

});


}

};







// تعديل كورس

export const updateCourse = async(req,res)=>{


try{


const course = await Course.findByIdAndUpdate(

req.params.id,

{

title:req.body.title,

classId:req.body.classId,

description:req.body.description,

videoUrl:req.body.videoUrl

},

{
new:true
}

);



res.json({

success:true,

course

});



}catch(error){

console.log(error);


res.status(500).json({

message:"Server Error"

});


}


};








// حذف كورس

export const deleteCourse = async(req,res)=>{


try{


await Course.findByIdAndDelete(
req.params.id
);



res.json({

success:true,

message:"Course Deleted"

});



}catch(error){


console.log(error);


res.status(500).json({

message:"Server Error"

});


}


};

export const getCoursesByClass = async (req,res)=>{

try{

const courses = await Course.find({
    classId:req.params.classId
})
.populate("classId");


res.json(courses);


}catch(error){

console.log(error);

res.status(500).json({
message:"Server Error"
});

}

};

// جلب كورسات الطالب حسب الصف الدراسي

export const getStudentCourses = async (req, res) => {

  try {

    const gradeName = req.user.grade;

    console.log("=================================");
    console.log("GRADE NAME:", gradeName);
    console.log("=================================");


    if (!gradeName) {

      return res.status(400).json({

        success: false,

        message: "الطالب ليس لديه صف دراسي",

        courses: []

      });

    }


    // =========================================
    // البحث عن الصف بالاسم مباشرة
    // =========================================

    const classData = await Class.findOne({

      name: gradeName.trim()

    });


    console.log("FOUND CLASS BY NAME:", classData);


    // =========================================
    // لو لم نجد الصف
    // =========================================

    if (!classData) {

      return res.status(200).json({

        success: true,

        courses: []

      });

    }


    // =========================================
    // جلب الكورسات
    // =========================================

    const courses = await Course.find({

      classId: classData._id

    })

      .populate("classId")

      .sort({

        createdAt: -1

      });


    console.log("CLASS ID:", classData._id);

    console.log("COURSES FOUND:", courses.length);

    console.log("COURSES:", courses);


    return res.status(200).json({

      success: true,

      courses: courses

    });


  } catch (error) {

    console.log(
      "GET STUDENT COURSES ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message: "Server Error",

      courses: []

    });

  }

};

// جلب كورس واحد

export const getCourseById = async(req,res)=>{

try{


const course = await Course.findById(
req.params.id
)
.populate("classId");



if(!course){

return res.status(404).json({

success:false,

message:"Course not found"

});

}



res.json({

success:true,

course

});



}catch(error){

console.log(error);


res.status(500).json({

success:false,

message:"Server Error"

});


}

};

