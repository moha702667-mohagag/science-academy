import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import api from "../../api/axios";

import {
FiAward,
FiCheckCircle,
FiHome
} from "react-icons/fi";


import "./ExamResult.css";



export default function ExamResult(){


const {examId,grade}=useParams();

const navigate=useNavigate();

const [resultsPublished,setResultsPublished]=useState(true);
const [resultMessage,setResultMessage]=useState("");

const [result,setResult]=useState(null);

const [loading,setLoading]=useState(true);



useEffect(()=>{

loadResult();

},[]);






const loadResult = async () => {

  try {

    const { data } = await api.get(
      `/exam-attempt/result/${examId}`
    );


    // ======================================
    // النتيجة لم يتم إعلانها
    // ======================================

    if (
      data.resultsPublished === false
    ) {

      setResultsPublished(false);

      setResultMessage(
        data.message ||
        "لم يتم إعلان نتيجة الامتحان من قبل المدرس"
      );

      return;
    }


    // ======================================
    // النتيجة متاحة
    // ======================================

    if (data.success) {

      setResultsPublished(true);

      setResult(
        data.result
      );

    } else {

      setResultMessage(
        data.message ||
        "لا توجد نتيجة"
      );

    }


  } catch (error) {

    console.log(
      "LOAD RESULT ERROR:",
      error.response?.data ||
      error
    );

    setResultMessage(
      error.response?.data?.message ||
      "حدث خطأ أثناء تحميل النتيجة"
    );

  } finally {

    setLoading(false);

  }

};




if(loading){


return(

<div className="exam-loading">

جاري تحميل النتيجة...

</div>

)

}







if (!resultsPublished) {

  return (

    <div className="exam-result-page">

      <div className="result-card result-hidden-card">

        <div className="result-icon">
          🔒
        </div>

        <h1>
          النتيجة لم تُعلن بعد
        </h1>

        <p className="result-hidden-message">

          تم تسليم الامتحان بنجاح،
          ولكن المدرس لم يُعلن النتيجة حتى الآن.

        </p>

        <p className="result-hidden-submessage">

          ستظهر نتيجتك وتصحيح إجاباتك هنا
          بمجرد إعلانها من المدرس.

        </p>

        <button
          onClick={() => navigate(`/class/${grade}`)}
        >

          <FiHome />

          العودة للوحة الطالب

        </button>

      </div>

    </div>

  );

}


if (!result) {

  return (

    <div className="no-result">

      {resultMessage || "لا توجد نتيجة"}

    </div>

  );

}






return(


<div className="exam-result-page">





<div className="result-card">



<div className="result-icon">

<FiAward/>

</div>




<h1>

نتيجة الامتحان

</h1>







<div className="score-box">


<h2>

{result.score}

<span>

/

{result.totalMarks}

</span>

</h2>



<p>

الدرجة النهائية

</p>


</div>









<div className="percentage">


<FiCheckCircle/>


النسبة:

{result.percentage}%


</div>









{

result.percentage >=50 ?


<div className="success">

🎉 مبروك لقد نجحت

</div>


:


<div className="failed">

حاول مرة أخرى

</div>


}









<button

onClick={()=>navigate(`/class/${grade}`)}
>


<FiHome/>

العودة للوحة الطالب


</button>

</div>
<div className="question-review">

<h2>
📚 مراجعة الإجابات
</h2>


{
result.questions.map((q,index)=>{


const studentAnswers = [...(q.studentAnswer || [])].sort();

const correctAnswers = [...(q.correctAnswers || [])].sort();


const isCorrect =

JSON.stringify(studentAnswers)

===

JSON.stringify(correctAnswers);



return(


<div 
className={`review-card ${
isCorrect 
? "correct-card"
: "wrong-card"
}`}
key={q.questionId}
>



<h3>
  {index + 1} - {q.question}
</h3>

{q.image && (
  <div className="teacher-result-question-image">
    <img
      src={q.image}
      alt={`صورة السؤال ${index + 1}`}
    />
  </div>
)}





<div className="student-answer">


<h4>
إجابتك:
</h4>



{

q.type === "essay"
?

<div className="essay-review">

<p>

{q.essayAnswer || "لم يتم الإجابة"}
</p>

{
q.reviewed
?

<div className="essay-mark">

✅ الدرجة:
<strong>

{q.marksAwarded}

/

{q.marks}

</strong>

</div>

:

<div className="essay-waiting">

🟡 في انتظار مراجعة المدرس

</div>

}

{
q.reviewed && q.teacherComment &&

<div className="teacher-feedback">

💬 تعليق المدرس

<p>
{q.teacherComment}
</p>

</div>
}

</div>


:


q.studentAnswer?.length > 0

?

q.studentAnswer.map(ans=>(

<span key={ans}>

{q.options[ans]?.text}

</span>

))


:

<span>

لم يتم الإجابة

</span>


}



</div>








{
q.type !== "essay" && (

<div className="correct-answer">

<h4>
الإجابة الصحيحة:
</h4>

{

q.correctAnswers.map(ans=>(

<span key={ans}>

{q.options[ans]?.text}

</span>

))

}

</div>

)
}







<div className="answer-status">

{

q.type === "essay"

?

(

q.reviewed

?

` تم التصحيح 👆👀👆`

:

` برجاء انتظر 👆👀👆`

)

:

(

isCorrect

?

"✅ إجابة صحيحة"

:

"❌ إجابة خاطئة"

)

}

</div>

{

q.explanation &&


<div className="explanation">

💡

<strong>
شرح الإجابة:
</strong>


<p>

{q.explanation}

</p>


</div>


}



</div>


)


})


}



</div>




</div>


);


}