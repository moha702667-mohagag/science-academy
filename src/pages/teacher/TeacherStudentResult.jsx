import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

import api from "../../api/axios";

import "./TeacherStudentResult.css";

export default function TeacherStudentResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    try {
      const res = await api.get(
        `/exam-attempt/student-result/${attemptId}`
      );

      const data = res.data;

      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-result-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل نتيجة الطالب...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="teacher-result-empty">
        <FiBookOpen />
        <h2>لا توجد نتيجة</h2>
        <p>تعذر العثور على نتيجة هذا الطالب.</p>

        <button onClick={() => navigate(-1)}>
          <FiArrowRight />
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="teacher-student-result">

      {/* ================= HEADER ================= */}

      <div className="teacher-result-header">

        <div className="teacher-result-title">

          <div className="title-icon">
            <FiAward />
          </div>

          <div>
            <h1>نتيجة الطالب</h1>

            <p>
              عرض تفاصيل إجابات الطالب وتصحيح الامتحان
            </p>
          </div>

        </div>

        <button
          className="student-result-back"
          onClick={() => navigate(-1)}
        >
          <FiArrowRight />
          رجوع
        </button>

      </div>


      {/* ================= STUDENT INFO ================= */}

      <div className="student-info-card">

        <div className="student-result-avatar">
          {result.student?.name?.charAt(0) || "ط"}
        </div>

        <div className="student-details">

          <span className="info-label">
            الطالب
          </span>

          <h2>
            {result.student?.name || "بدون اسم"}
          </h2>

          <div className="student-meta">

            <span>
              <FiBookOpen />
              الصف: {result.student?.grade || "غير محدد"}
            </span>

            <span>
              <FiPhone />
              {result.student?.phone || "لا يوجد رقم"}
            </span>

          </div>

        </div>

        <div className="student-score-box">

          <span>
            الدرجة النهائية
          </span>

          <strong>
            {result.score}
          </strong>

          <small>
            من {result.exam?.totalMarks}
          </small>

        </div>

      </div>


      {/* ================= STATISTICS ================= */}

      <div className="student-result-statistics">

        <div className="student-stat-card">

          <div className="student-stat-icon blue">
            <FiBookOpen />
          </div>

          <div>
            <span>الامتحان</span>

            <h3>
              {result.exam?.title}
            </h3>
          </div>

        </div>


        <div className="student-stat-card">

          <div className="student-stat-icon green">
            <FiAward />
          </div>

          <div>
            <span>النسبة المئوية</span>

            <h3>
              {result.percentage}%
            </h3>
          </div>

        </div>


        <div className="student-stat-card">

          <div
            className={`student-stat-icon ${
              result.status === "reviewed"
                ? "green"
                : "orange"
            }`}
          >
            {result.status === "reviewed"
              ? <FiCheckCircle />
              : <FiClock />
            }
          </div>

          <div>

            <span>حالة النتيجة</span>

            <h3>

              {result.status === "reviewed"
                ? "تم التصحيح"
                : "بانتظار التصحيح"
              }

            </h3>

          </div>

        </div>

      </div>


      {/* ================= QUESTIONS ================= */}

      <div className="student-questions-section">

        <div className="questions-section-header">

          <div>

            <h2>
              مراجعة إجابات الطالب
            </h2>

            <p>
              تفاصيل إجابة الطالب لكل سؤال
            </p>

          </div>

          <div className="questions-count">
            {result.questions?.length || 0} سؤال
          </div>

        </div>


        {result.questions?.map((q, index) => {

          const studentAnswers =
            q.studentAnswer || [];

          const correctAnswers =
            q.correctAnswers || [];

          const isCorrect =
            JSON.stringify(
              [...studentAnswers].sort()
            ) ===
            JSON.stringify(
              [...correctAnswers].sort()
            );


          return (

            <div
              className="teacher-question-card"
              key={q.questionId}
            >

              {/* Question Header */}

              <div className="teacher-question-header">

                <div className="teacher-question-number">
                  السؤال {index + 1}
                </div>

                <div className="teacher-question-mark">
                  {q.marks} درجة
                </div>

              </div>


              {/* Question */}

              <div className="teacher-question-text">
                {q.question}
              </div>


              {/* Question Image */}

              {q.image && (

                <div className="teacher-result-question-image">

                  <img
                    src={q.image}
                    alt={`صورة السؤال ${index + 1}`}
                  />

                </div>

              )}


              {/* Student Answer */}

              <div className="teacher-answer-box">

                <h4>
                  إجابة الطالب
                </h4>

                {q.type === "essay" ? (

                  <p className="essay-answer-text">
                    {q.essayAnswer ||
                      "لم يقم الطالب بالإجابة"}
                  </p>

                ) : (

                  studentAnswers.length > 0 ? (

                    <div className="answer-options">

                      {studentAnswers.map(ans => (

                        <span key={ans}>
                          {q.options?.[ans]?.text ||
                            "اختيار غير معروف"}
                        </span>

                      ))}

                    </div>

                  ) : (

                    <p className="no-answer">
                      لم تتم الإجابة
                    </p>

                  )

                )}

              </div>


              {/* ================= ESSAY ================= */}

              {q.type === "essay" ? (

                <div className="essay-result-section">

                  {q.reviewed ? (

                    <>

                      <div className="essay-score-box">

                        <FiAward />

                        <div>

                          <span>
                            درجة المدرس
                          </span>

                          <strong>
                            {q.marksAwarded}
                            <small>
                              /{q.marks}
                            </small>
                          </strong>

                        </div>

                      </div>


                      {q.teacherComment && (

                        <div className="teacher-comment-box">

                          <h4>
                            💬 تعليق المدرس
                          </h4>

                          <p>
                            {q.teacherComment}
                          </p>

                        </div>

                      )}

                    </>

                  ) : (

                    <div className="essay-waiting">

                      <FiClock />

                      <div>

                        <strong>
                          في انتظار المراجعة
                        </strong>

                        <p>
                          لم يتم تصحيح السؤال المقالي حتى الآن.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              ) : (

                /* ================= NORMAL QUESTION ================= */

                <>

                  <div className="teacher-correct-answer">

                    <h4>
                      الإجابة الصحيحة
                    </h4>

                    <div className="answer-options correct-options">

                      {correctAnswers.map(ans => (

                        <span key={ans}>
                          {q.options?.[ans]?.text ||
                            "اختيار غير معروف"}
                        </span>

                      ))}

                    </div>

                  </div>


                  <div
                    className={
                      isCorrect
                        ? "question-status correct"
                        : "question-status wrong"
                    }
                  >

                    {isCorrect ? (

                      <>
                        <FiCheckCircle />
                        إجابة صحيحة
                      </>

                    ) : (

                      <>
                        <FiXCircle />
                        إجابة خاطئة
                      </>

                    )}

                  </div>

                </>

              )}

            </div>

          );

        })}

      </div>

    </div>
  );
}