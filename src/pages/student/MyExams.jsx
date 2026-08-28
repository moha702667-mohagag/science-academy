import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiClock,
  FiBookOpen,
  FiAward,
  FiPlayCircle,
  FiCheckCircle,
  FiBarChart2,
  FiArrowRight,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";

import "./MyExams.css";

import api from "../../api/axios";

export default function MyExams() {

  // ======================================
  // State
  // ======================================

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // Hooks
  // ======================================

  const navigate = useNavigate();

  const canRetry = (exam) => {
    return exam.attemptStatus === "can_retry";
  };

  // ======================================
  // Load Exams
  // ======================================

  useEffect(() => {

    loadExams();

  }, []);

  const loadExams = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // ======================================
      // No Token
      // ======================================

      if (!token) {

        navigate("/auth");

        return;

      }

      // ======================================
      // Get Exams
      // ======================================

      const res = await api.get(
        "/exams/student"
      );

      const data = res.data;

      console.log(
        "STUDENT EXAMS:",
        data
      );

      // ======================================
      // Success
      // ======================================

      if (data.success) {

        setExams(
          Array.isArray(data.exams)
            ? data.exams
            : []
        );

      } else {

        setExams([]);

        setError(
          data.message ||
          "حدث خطأ أثناء تحميل الامتحانات"
        );

      }

    } catch (error) {

      console.log(
        "LOAD EXAMS ERROR:",
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

      setExams([]);

      setError(
        error.response?.data?.message ||
        "تعذر الاتصال بالخادم"
      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================
  // Check Completed
  // ======================================

  const isCompleted = (exam) => {

    return (
      !exam.canStart &&
      (
        exam.attemptStatus === "submitted" ||
        exam.attemptStatus === "reviewed"
      )
    );

  };

  // ======================================
  // Check In Progress
  // ======================================

  const isInProgress = (exam) => {

    return (
      exam.attemptStatus === "in_progress"
    );

  };

  // ======================================
  // Open Exam
  // ======================================

  const startExam = (exam) => {

    // ======================================
    // محاولة قيد الحل
    // ======================================

    if (isInProgress(exam)) {

      navigate(
        `/exam/${exam._id}`
      );

      return;

    }

    // ======================================
    // لسه فيه محاولات متاحة
    // ======================================

    if (canRetry(exam)) {

      navigate(
        `/exam/${exam._id}`
      );

      return;

    }

    // ======================================
    // خلص كل المحاولات
    // ======================================

    if (isCompleted(exam)) {

      navigate(
        `/exam-result/${exam._id}`
      );

      return;

    }

    // ======================================
    // أول محاولة
    // ======================================

    navigate(
      `/exam/${exam._id}`
    );

  };

  // ======================================
  // Button Text
  // ======================================

  const getButtonContent = (exam) => {

    if (isCompleted(exam)) {

      return (
        <>
          <FiBarChart2 />

          <span>
            عرض النتيجة
          </span>
        </>
      );

    }

    if (isInProgress(exam)) {

      return (
        <>
          <FiPlayCircle />

          <span>
            متابعة الامتحان
          </span>
        </>
      );

    }

    if (canRetry(exam)) {

      return (
        <>
          <FiRefreshCw />

          <span>
            إعادة الامتحان
          </span>
        </>
      );

    }

    return (
      <>
        <FiPlayCircle />

        <span>
          ابدأ الامتحان
        </span>
      </>
    );

  };

  // ======================================
  // Status Text
  // ======================================

  const getStatus = (exam) => {

    if (isCompleted(exam)) {

      return "مكتمل";

    }

    if (isInProgress(exam)) {

      return "جاري الحل";

    }

    if (canRetry(exam)) {

      return `متبقي ${exam.remainingAttempts} محاولة`;

    }

    if (exam.status !== "published") {

      return "غير متاح";

    }

    return "لم يبدأ بعد";

  };

  // ======================================
  // Status Class
  // ======================================

  const getStatusClass = (exam) => {

    if (isCompleted(exam)) {

      return "completed-status";

    }

    if (isInProgress(exam)) {

      return "running-status";

    }

    if (exam.status !== "published") {

      return "unavailable-status";

    }

    return "new-status";

  };

  // ======================================
  // Questions Count
  // ======================================

  const getQuestionsCount = (exam) => {

    return (
      exam.questionsCount ??
      exam.questionCount ??
      exam.questions?.length ??
      0
    );

  };

  // ======================================
  // Total Marks
  // ======================================

  const getTotalMarks = (exam) => {

    return (
      exam.totalMarks ??
      exam.passingMarks ??
      0
    );

  };

  // ======================================
  // Duration
  // ======================================

  const getDuration = (exam) => {

    if (
      exam.duration === undefined ||
      exam.duration === null
    ) {

      return "غير محددة";

    }

    return `${exam.duration} دقيقة`;

  };

  // ======================================
  // Loading
  // ======================================

  if (loading) {

    return (

      <div className="exam-loading">

        <div className="exam-loading-icon">

          <FiBookOpen />

        </div>

        <p>
          جاري تحميل الامتحانات...
        </p>

        <span>
          لحظات ونجهز لك الامتحانات 📝
        </span>

      </div>

    );

  }

  // ======================================
  // Page
  // ======================================

  return (

    <div className="my-exams-container">

      {/* ==================================
          Header
      ================================== */}

      <div className="exam-header">

        <div className="exam-header-content">

          <div className="exam-header-icon">

            <FiBookOpen />

          </div>

          <div className="exam-header-text">

            <h1>
              امتحاناتي
            </h1>

            <p>
              حل الامتحانات الخاصة بصفك
              واحصل على نتيجتك مباشرة
            </p>

          </div>

        </div>

        <button
          className="exam-back-btn"
          onClick={() => navigate(-1)}
        >

          <FiArrowRight />

          <span>
            العودة
          </span>

        </button>

      </div>


      {/* ==================================
          Error
      ================================== */}

      {error && exams.length === 0 && (

        <div className="exam-error">

          <div className="exam-error-icon">

            <FiAlertCircle />

          </div>

          <h2>
            حدث خطأ
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={loadExams}
          >

            <FiRefreshCw />

            إعادة المحاولة

          </button>

        </div>

      )}


      {/* ==================================
          No Exams
      ================================== */}

      {!error && exams.length === 0 && (

        <div className="no-exams">

          <div className="no-exams-icon">

            <FiBookOpen />

          </div>

          <h2>
            لا يوجد امتحانات متاحة حاليًا 😊
          </h2>

          <p>
            عندما يقوم المدرس بإضافة امتحان
            جديد لصفك سيظهر هنا تلقائيًا.
          </p>

        </div>

      )}


      {/* ==================================
          Exams Grid
      ================================== */}

      {exams.length > 0 && (

        <div className="exam-grid">

          {exams.map((exam) => {

            const completed =
              isCompleted(exam);

            const inProgress =
              isInProgress(exam);

            const published =
              exam.status === "published";

            const questionsCount =
              getQuestionsCount(exam);

            const totalMarks =
              getTotalMarks(exam);

            return (

              <div
                className={`exam-card ${
                  completed
                    ? "exam-card-completed"
                    : ""
                } ${
                  inProgress
                    ? "exam-card-running"
                    : ""
                }`}
                key={exam._id}
              >

                {/* ==================================
                    Card Top
                ================================== */}

                <div className="exam-title">

                  <div className="exam-title-content">

                    <div className="exam-card-icon">

                      {completed ? (
                        <FiCheckCircle />
                      ) : (
                        <FiBookOpen />
                      )}

                    </div>

                    <div>

                      <h2>
                        {exam.title}
                      </h2>

                      <span className="exam-subtitle">
                        امتحان تدريبي
                      </span>

                    </div>

                  </div>


                  {/* Status */}

                  <span
                    className={`exam-status ${getStatusClass(
                      exam
                    )}`}
                  >

                    {completed && (
                      <FiCheckCircle />
                    )}

                    {inProgress && (
                      <FiClock />
                    )}

                    {!completed &&
                      !inProgress &&
                      published && (
                        <FiPlayCircle />
                      )}

                    {!completed &&
                      !inProgress &&
                      !published && (
                        <FiAlertCircle />
                      )}

                    {getStatus(exam)}

                  </span>

                </div>


                {/* ==================================
                    Description
                ================================== */}

                <p className="exam-description">

                  {exam.description ||
                    "امتحان تدريبي يساعدك على مراجعة وفهم الدرس."}

                </p>


                {/* ==================================
                    Exam Information
                ================================== */}

                <div className="exam-info">

                  {/* Questions */}

                  <div className="exam-info-item">

                    <div className="exam-info-icon">

                      <FiBookOpen />

                    </div>

                    <div>

                      <span>
                        عدد الأسئلة
                      </span>

                      <strong>
                        {questionsCount}
                      </strong>

                    </div>

                  </div>


                  {/* Marks */}

                  <div className="exam-info-item">

                    <div className="exam-info-icon">

                      <FiAward />

                    </div>

                    <div>

                      <span>
                        الدرجة النهائية
                      </span>

                      <strong>
                        {totalMarks}
                      </strong>

                    </div>

                  </div>


                  {/* Duration */}

                  <div className="exam-info-item">

                    <div className="exam-info-icon">

                      <FiClock />

                    </div>

                    <div>

                      <span>
                        مدة الامتحان
                      </span>

                      <strong>
                        {getDuration(exam)}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* ==================================
                    Result
                ================================== */}

                {completed &&
                  exam.result && (

                    <div className="exam-result-box">

                      <div className="result-main">

                        <div className="result-icon">

                          <FiCheckCircle />

                        </div>

                        <div>

                          <span>
                            نتيجتك
                          </span>

                          <strong>
                            {exam.result.score}
                            {" "}
                            /
                            {" "}
                            {totalMarks}
                          </strong>

                        </div>

                      </div>


                      <div className="result-divider" />


                      <div className="result-percentage">

                        <span>
                          النسبة
                        </span>

                        <strong>
                          {exam.result.percentage}%
                        </strong>

                      </div>

                    </div>

                  )}


                {/* ==================================
                    In Progress Notice
                ================================== */}

                {inProgress && (

                  <div className="exam-running-box">

                    <FiClock />

                    <span>
                      لديك محاولة قيد الحل،
                      يمكنك متابعة الامتحان من حيث توقفت.
                    </span>

                  </div>

                )}


                {/* ==================================
                    Button
                ================================== */}

                <button
                  className={
                    completed
                      ? "result-btn"
                      : "start-exam-btn"
                  }

                  disabled={
                    !published ||
                    (
                      !inProgress &&
                      !completed &&
                      !exam.canStart
                    )
                  }

                  onClick={() =>
                    startExam(exam)
                  }
                >

                  {getButtonContent(exam)}

                </button>


                {/* ==================================
                    Unavailable
                ================================== */}

                {!published &&
                  !inProgress &&
                  !completed && (

                    <div className="exam-unavailable">

                      <FiAlertCircle />

                      الامتحان غير متاح حاليًا

                    </div>

                  )}

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}