import { useEffect, useState } from "react";
import "./EssayReview.css";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";


export default function EssayReview() {

  const [reviews, setReviews] = useState([]);

  const navigate = useNavigate();


  // ======================================
  // Load Reviews
  // ======================================

  useEffect(() => {

    loadReviews();

  }, []);


  const loadReviews = async () => {

    try {

      const res = await api.get(
        "/exam-attempt/essay/reviews"
      );

      const data = res.data;


      console.log(
        "ESSAY REVIEWS:",
        data
      );


      if (data.success) {

        setReviews(
          Array.isArray(data.reviews)
            ? data.reviews
            : []
        );

      } else {

        setReviews([]);

      }

    } catch (error) {

      console.log(
        "LOAD ESSAY REVIEWS ERROR:",
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


      setReviews([]);

    }

  };


  // ======================================
  // Page
  // ======================================

  return (

    <div className="essay-review-page">


      {/* ==================================
          Header
      ================================== */}

      <div className="essay-header">

        <div className="essay-header-content">


          {/* Title */}

          <div className="essay-title">

            <div className="essay-title-icon">
              ✍️
            </div>


            <div>

              <h1>
                تصحيح الأسئلة المقالية
              </h1>

              <p>
                مراجعة إجابات الطلاب وإضافة الدرجات
              </p>

            </div>

          </div>


          {/* Back */}

          <button

            className="essay-back-btn"

            onClick={() =>
              navigate("/teacher")
            }

          >

            <span>
              العودة
            </span>

            <span className="back-arrow">
              ←
            </span>

          </button>


        </div>

      </div>


      {/* ==================================
          Reviews
      ================================== */}

      {
        reviews.length === 0 ? (

          <div className="essay-empty-card">

            <h2>
              لا توجد إجابات تحتاج تصحيح
            </h2>

          </div>

        ) : (

          reviews.map((item) => (

            <div

              className="review-student-card"

              key={item._id}

            >


              {/* ==================================
                  Student
              ================================== */}

              <div className="review-card-top">


                <div className="student-avatar">

                  {
                    item.studentId?.fullName
                      ?.charAt(0)
                  }

                </div>


                <div>

                  <h2>

                    {
                      item.studentId?.fullName ||
                      "طالب"
                    }

                  </h2>


                  <span>

                    📚{" "}

                    {
                      item.studentId?.grade ||
                      "غير محدد"
                    }

                  </span>

                </div>


              </div>


              {/* ==================================
                  Information
              ================================== */}

              <div className="review-info">


                <div>

                  <strong>
                    الامتحان
                  </strong>


                  <p>

                    {
                      item.examId?.title ||
                      "غير محدد"
                    }

                  </p>

                </div>


                <div>

                  <strong>
                    الحالة
                  </strong>


                  <p className="waiting-status">

                    🟡 يحتاج تصحيح

                  </p>

                </div>


              </div>


              {/* ==================================
                  Open Correction
              ================================== */}

              <button

                className="open-correction-btn"

                onClick={() =>
                  navigate(
                    `/teacher/essay-correction/${item._id}`
                  )
                }

              >

                فتح التصحيح

              </button>


            </div>

          ))

        )
      }


    </div>

  );

}