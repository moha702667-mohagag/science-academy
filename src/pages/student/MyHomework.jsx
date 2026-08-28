import { useEffect, useState } from "react";
import "./MyHomework.css";

import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiExternalLink,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";

import useProgress from "../../hooks/useProgress";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const MyHomework = () => {

  // ======================================
  // State
  // ======================================

  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================
  // Hooks
  // ======================================

  const navigate = useNavigate();

  const {
    startItem,
    getStatus
  } = useProgress();

  // ======================================
  // Load Homeworks
  // ======================================

  useEffect(() => {

    const fetchHomeworks = async () => {

      try {

        setLoading(true);

        const token = localStorage.getItem("token");

        // ======================================
        // No Token
        // ======================================

        if (!token) {

          navigate("/auth");

          return;

        }

        // ======================================
        // Load Homeworks
        // ======================================

        const res = await api.get(
          "/homeworks/student"
        );

        const data = res.data;

        console.log(
          "STUDENT HOMEWORKS:",
          data
        );

        // ======================================
        // Homeworks
        // ======================================

        if (data.success) {

          setHomeworks(
            data.homeworks || []
          );

        } else {

          setHomeworks([]);

        }

      } catch (error) {

        console.log(
          "LOAD HOMEWORKS ERROR:",
          error
        );

        // ======================================
        // Token Expired / Unauthorized
        // ======================================

        if (error.response?.status === 401) {

          console.log(
            "Token is invalid or expired"
          );

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/auth");

          return;

        }

        setHomeworks([]);

      } finally {

        setLoading(false);

      }

    };

    fetchHomeworks();

  }, [navigate]);


  // ======================================
  // Check Homework Status
  // ======================================

  const checkStatus = (date) => {

    // لو مفيش تاريخ
    if (!date) {

      return "متاح";

    }

    const today = new Date();

    const dueDate = new Date(date);

    if (dueDate < today) {

      return "منتهي";

    }

    return "متاح";

  };


  // ======================================
  // Get Progress Status
  // ======================================

  const getHomeworkProgress = (id) => {

    return getStatus(id);

  };


  // ======================================
  // Open Homework
  // ======================================

  const openHomework = (item) => {

    // ======================================
    // التأكد إن الواجب لسه متاح
    // ======================================

    if (
      checkStatus(item.dueDate) === "منتهي"
    ) {

      return;

    }


    // ======================================
    // التأكد من وجود الرابط
    // ======================================

    if (!item.formUrl) {

      alert(
        "رابط الواجب غير متاح حاليًا"
      );

      return;

    }


    // ======================================
    // فتح الفورم
    // ======================================

    window.open(
      item.formUrl,
      "_blank",
      "noopener,noreferrer"
    );


    // ======================================
    // تسجيل بداية الواجب
    // ======================================

    startItem(
      item._id,
      "homework"
    ).catch((error) => {

      console.log(
        "START HOMEWORK ERROR:",
        error
      );

    });

  };


  // ======================================
  // Loading
  // ======================================

  if (loading) {

    return (

      <div className="homework-loading">

        <FiBookOpen />

        <span>
          جاري تحميل الواجبات 📚...
        </span>

      </div>

    );

  }


  // ======================================
  // Page
  // ======================================

  return (

    <div className="my-homework-container">

      {/* ==================================
          Header
      ================================== */}

      <div className="homework-header">

        <div className="homework-header-content">

          <div className="homework-header-icon">

            <FiBookOpen />

          </div>

          <div>

            <h1>
              واجباتي
            </h1>

            <p>
              تابع جميع الواجبات الخاصة بصفك الدراسي
            </p>

          </div>

        </div>


        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >

          <FiArrowRight />

          العودة

        </button>

      </div>


      {/* ==================================
          No Homework
      ================================== */}

      {homeworks.length === 0 ? (

        <div className="no-homework">

          <div className="no-homework-icon">

            <FiBookOpen />

          </div>

          <h2>
            لا يوجد واجبات متاحة حاليا 😊
          </h2>

          <p>
            عندما يقوم المدرس بإضافة واجب جديد
            سيظهر هنا تلقائيًا.
          </p>

        </div>

      ) : (

        /* ==================================
           Homework Grid
        ================================== */

        <div className="homework-grid">

          {homeworks.map((item) => {

            const homeworkStatus =
              checkStatus(item.dueDate);

            const progressStatus =
              getHomeworkProgress(item._id);


            return (

              <div
                className="homework-card"
                key={item._id}
              >

                {/* ==================================
                    Top
                ================================== */}

                <div className="homework-top">

                  <div className="homework-title-box">

                    <div className="homework-card-icon">

                      <FiBookOpen />

                    </div>

                    <h2>
                      {item.title}
                    </h2>

                  </div>


                  {/* Homework Availability */}

                  <span
                    className={
                      homeworkStatus === "متاح"
                        ? "available"
                        : "expired"
                    }
                  >

                    {homeworkStatus === "متاح" ? (

                      <>
                        <FiCheckCircle />
                        متاح
                      </>

                    ) : (

                      <>
                        <FiClock />
                        منتهي
                      </>

                    )}

                  </span>

                </div>


                {/* ==================================
                    Description
                ================================== */}

                <p className="homework-description">

                  {item.description ||
                    "لا يوجد وصف لهذا الواجب"}

                </p>


                {/* ==================================
                    Homework Information
                ================================== */}

                <div className="homework-info">

                  {/* Due Date */}

                  <div className="homework-info-item">

                    <FiCalendar />

                    <div>

                      <span>
                        آخر موعد
                      </span>

                      <strong>

                        {item.dueDate
                          ? new Date(
                              item.dueDate
                            ).toLocaleDateString(
                              "ar-EG",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }
                            )
                          : "غير محدد"}

                      </strong>

                    </div>

                  </div>


                  {/* Class */}

                  <div className="homework-info-item">

                    <FiBookOpen />

                    <div>

                      <span>
                        الصف
                      </span>

                      <strong>

                        {item.classId?.name ||
                          item.classId?.gradeLevel ||
                          "غير محدد"}

                      </strong>

                    </div>

                  </div>

                </div>


                {/* ==================================
                    Progress
                ================================== */}

                <div className="progress-status">

                  {/* Not Started */}

                  {progressStatus ===
                    "not_started" && (

                    <div className="status not-started">

                      🔴

                      <span>
                        لم يبدأ بعد
                      </span>

                    </div>

                  )}


                  {/* Started */}

                  {progressStatus ===
                    "started" && (

                    <div className="status started">

                      🟡

                      <span>
                        جاري الحل
                      </span>

                    </div>

                  )}


                  {/* Completed */}

                  {progressStatus ===
                    "completed" && (

                    <div className="status completed">

                      🟢

                      <span>
                        تم التسليم
                      </span>

                    </div>

                  )}

                </div>


                {/* ==================================
                    Open Homework Button
                ================================== */}

                {item.formUrl && (

                  <button
                    className="open-homework"
                    disabled={
                      homeworkStatus ===
                      "منتهي"
                    }
                    onClick={() =>
                      openHomework(item)
                    }
                  >

                    {homeworkStatus ===
                    "منتهي" ? (

                      <>
                        <FiClock />

                        انتهى موعد الواجب
                      </>

                    ) : (

                      <>
                        <FiExternalLink />

                        فتح الواجب
                      </>

                    )}

                  </button>

                )}


                {/* No Form URL */}

                {!item.formUrl && (

                  <div className="no-form-url">

                    ⚠️ رابط الواجب غير متاح حاليًا

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

};

export default MyHomework;