import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./EssayCorrection.css";

import api from "../../api/axios";


export default function EssayCorrection() {

  const { attemptId } = useParams();

  const navigate = useNavigate();


  const [attempt, setAttempt] = useState(null);

  const [marks, setMarks] = useState({});

  const [comments, setComments] = useState({});


  // ======================================
  // Load Attempt
  // ======================================

  useEffect(() => {

    loadAttempt();

  }, []);


  const loadAttempt = async () => {

    try {

      const res = await api.get(
        `/exam-attempt/${attemptId}`
      );

      const data = res.data;


      console.log(
        "ESSAY ATTEMPT:",
        data
      );


      if (data.success) {

        setAttempt(data);

      }

    } catch (error) {

      console.log(
        "LOAD ESSAY ATTEMPT ERROR:",
        error
      );


      // ======================================
      // Unauthorized
      // ======================================

      if (error.response?.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/auth");

        return;

      }

    }

  };


  // ======================================
  // Mark Change
  // ======================================

  const handleMarkChange = (
    questionId,
    value
  ) => {

    setMarks((prev) => ({

      ...prev,

      [questionId]: Number(value)

    }));

  };


  // ======================================
  // Comment Change
  // ======================================

  const handleCommentChange = (
    questionId,
    value
  ) => {

    setComments((prev) => ({

      ...prev,

      [questionId]: value

    }));

  };


  // ======================================
  // Save Review
  // ======================================

  const saveReview = async () => {

    const answers = Object.keys(marks).map(
      (id) => ({

        questionId: id,

        marksAwarded: marks[id],

        teacherComment:
          comments[id] || ""

      })
    );


    try {

      const res = await api.put(

        `/exam-attempt/${attempt.attempt._id}/review`,

        {
          answers
        }

      );


      const data = res.data;


      console.log(
        "SAVE REVIEW:",
        data
      );


      if (data.success) {

        alert(
          "تم حفظ التصحيح بنجاح ✅"
        );

        navigate(
          "/teacher/essay-review"
        );

      }

    } catch (error) {

      console.log(
        "SAVE REVIEW ERROR:",
        error
      );


      // ======================================
      // Unauthorized
      // ======================================

      if (error.response?.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/auth");

        return;

      }


      alert(
        error.response?.data?.message ||
        "حدث خطأ أثناء حفظ التصحيح"
      );

    }

  };


  // ======================================
  // Loading
  // ======================================

  if (!attempt) {

    return (

      <div className="essay-loading">

        جاري تحميل الإجابات...

      </div>

    );

  }


  // ======================================
  // Page
  // ======================================

  return (

    <div className="essay-correction-page">


      {/* ==================================
          Header
      ================================== */}

      <div className="correction-header">

        <div>

          <h1>
            تصحيح الأسئلة المقالية
          </h1>

          <p>
            راجع إجابات الطالب وأضف الدرجة المناسبة لكل سؤال.
          </p>

        </div>


        {/* ==================================
            Student Card
        ================================== */}

        <div className="student-card">

          <div className="student-avatar">

            {
              attempt.attempt.studentId.fullName
                ?.charAt(0)
            }

          </div>


          <div>

            <h3>

              {
                attempt.attempt.studentId.fullName
              }

            </h3>


            <p>

              📚 الصف:

              {" "}

              {
                attempt.attempt.studentId.grade
              }

            </p>


            <p>

              📞 الهاتف:

              {" "}

              {
                attempt.attempt.studentId.phone
              }

            </p>


            <span>

              الدرجة الحالية:

              {" "}

              {
                attempt.attempt.score
              }

            </span>

          </div>

        </div>

      </div>


      {/* ==================================
          Essay Questions
      ================================== */}

      {
        attempt.questions
          .filter(
            (q) => q.type === "essay"
          )
          .map((q, index) => (

            <div
              className="essay-card"
              key={q._id}
            >


              {/* Header */}

              <div className="essay-card-header">

                <h2>

                  السؤال {index + 1}

                </h2>


                <div className="question-mark">

                  الدرجة الكلية

                  <b>
                    {q.marks}
                  </b>

                </div>

              </div>


              {/* Question Image */}

              {
                q.image && (

                  <img
                    src={q.image}
                    alt=""
                    className="essay-question-image"
                  />

                )
              }


              {/* Question */}

              <p className="question-text">

                {q.question}

              </p>


              {/* Student Answer */}

              <div className="answer-box">

                <h4>
                  إجابة الطالب
                </h4>


                <div className="answer-content">

                  {
                    attempt.attempt.answers.find(

                      (a) =>
                        String(a.questionId) ===
                        String(q._id)

                    )?.essayAnswer

                    ||

                    "لم يقم الطالب بالإجابة."

                  }

                </div>

              </div>


              {/* Grade */}

              <div className="grade-row">

                <label>
                  درجة السؤال
                </label>


                <div className="grade-input">

                  <input

                    type="number"

                    min="0"

                    max={q.marks}

                    value={
                      marks[q._id] ?? ""
                    }

                    onChange={(e) =>
                      handleMarkChange(
                        q._id,
                        e.target.value
                      )
                    }

                  />

                  <span>

                    /

                    {q.marks}

                  </span>

                </div>

              </div>


              {/* Teacher Comment */}

              <div className="teacher-comment-box">

                <label>
                  تعليق المدرس
                </label>


                <textarea

                  className="teacher-comment"

                  placeholder="اكتب تعليقًا لهذا السؤال..."

                  value={
                    comments[q._id] || ""
                  }

                  onChange={(e) =>
                    handleCommentChange(
                      q._id,
                      e.target.value
                    )
                  }

                />

              </div>


            </div>

          ))
      }


      {/* ==================================
          Save
      ================================== */}

      <div className="save-review-box">

        <button

          className="save-review"

          onClick={saveReview}

        >

          حفظ التصحيح

        </button>

      </div>


    </div>

  );

}