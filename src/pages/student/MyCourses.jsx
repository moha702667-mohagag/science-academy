import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiVideo,
  FiArrowRight
} from "react-icons/fi";

import api from "../../api/axios";


import "./MyCourses.css";

import useProgress from "../../hooks/useProgress";
import { useNavigate } from "react-router-dom";

export default function MyCourses() {

  // ======================================
  // State
  // ======================================

  const [courses, setCourses] = useState([]);
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
  // Load Courses
  // ======================================

  useEffect(() => {

    loadCourses();

  }, []);

  const loadCourses = async () => {

  try {

    setLoading(true);

    const { data } = await api.get(
      "/courses/student"
    );

    console.log(
      "MY COURSES:",
      data
    );

    if (data.success) {

      setCourses(
        data.courses || []
      );

    } else {

      setCourses([]);

    }

  } catch (error) {

    console.log(
      "LOAD COURSES ERROR:",
      error.response?.data ||
      error
    );

    // ======================================
    // Token Expired
    // ======================================

    if (
      error.response?.status === 401
    ) {

      console.log(
        "Token is invalid or expired"
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate("/auth");

      return;

    }

    setCourses([]);

  } finally {

    setLoading(false);

  }

};

  // ======================================
  // Open Course
  // ======================================

  const openCourse = async (course) => {

    try {

      await startItem(
        course._id,
        "course"
      );

    } catch (error) {

      console.log(
        "START COURSE ERROR:",
        error
      );

    }

    navigate(
      `/course/${course._id}`
    );

  };

  // ======================================
  // Loading
  // ======================================

  if (loading) {

    return (

      <div className="courses-loading">

        جاري تحميل الكورسات 📚...

      </div>

    );

  }

  // ======================================
  // Page
  // ======================================

  return (

    <div className="my-courses">

      {/* ================================
          Header
      ================================= */}

      <div className="courses-header">

        <h1>

          <FiBookOpen />

          كورساتي

        </h1>

        <button
          onClick={() => navigate(-1)}
        >

          <FiArrowRight />

          العودة

        </button>

      </div>


      {/* ================================
          No Courses
      ================================= */}

      {courses.length === 0 ? (

        <div className="no-courses">

          لا يوجد كورسات متاحة حاليا 😊

        </div>

      ) : (

        /* ================================
           Courses
        ================================= */

        <div className="courses-grid">

          {courses.map((course) => (

            <div
              className="course-card"
              key={course._id}
            >

              {/* Title */}

              <h2>

                {course.title}

              </h2>


              {/* Description */}

              <p>

                {course.description ||
                  "لا يوجد وصف للكورس"}

              </p>


              {/* Class */}

              <span>

                📚 الصف:

                {" "}

                {course.classId?.name ||
                  "غير محدد"}

              </span>


              {/* Video */}

              {course.videoUrl && (

                <>

                  <button
                    className="watch-btn"
                    onClick={() =>
                      openCourse(course)
                    }
                  >

                    <FiVideo />

                    مشاهدة الدرس

                  </button>


                  {/* =========================
                      Progress Status
                  ========================= */}

                  {getStatus(course._id) ===
                    "not_started" && (

                    <div className="status not-started">

                      🔴 لم يبدأ بعد

                    </div>

                  )}


                  {getStatus(course._id) ===
                    "started" && (

                    <div className="status started">

                      🟡 جاري المشاهدة

                    </div>

                  )}


                  {getStatus(course._id) ===
                    "completed" && (

                    <div className="status completed">

                      🟢 تم الانتهاء

                    </div>

                  )}

                </>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

}