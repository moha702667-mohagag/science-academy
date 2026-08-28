import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiAward,
  FiClipboard,
  FiTrendingUp,
  FiEye
} from "react-icons/fi";

import "./MyResults.css";

import api from "../../api/axios";

export default function MyResults() {

  const navigate = useNavigate();

  const [results, setResults] = useState([]);

  const [statistics, setStatistics] = useState({
    totalExams: 0,
    averagePercentage: 0,
    highestPercentage: 0
  });

  const [loading, setLoading] = useState(true);


  // ======================================
  // Load Results
  // ======================================

  useEffect(() => {

    loadResults();

  }, []);


  const loadResults = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/exam-attempt/results"
      );

      const data = res.data;

      console.log(
        "STUDENT RESULTS:",
        data
      );


      // ======================================
      // Success
      // ======================================

      if (data.success) {

        setResults(
          Array.isArray(data.results)
            ? data.results
            : []
        );

        setStatistics(
          data.statistics || {
            totalExams: 0,
            averagePercentage: 0,
            highestPercentage: 0
          }
        );

      } else {

        setResults([]);

      }


    } catch (error) {

      console.log(
        "LOAD RESULTS ERROR:",
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

      setResults([]);

    } finally {

      setLoading(false);

    }

  };


  // ======================================
  // Result Status
  // ======================================

  const getStatus = (percentage) => {

    if (percentage >= 90) {

      return {
        text: "ممتاز 🔥",
        class: "excellent"
      };

    }


    if (percentage >= 70) {

      return {
        text: "جيد جدًا 👏",
        class: "good"
      };

    }


    return {
      text: "يحتاج مراجعة 📚",
      class: "need-work"
    };

  };


  // ======================================
  // Loading
  // ======================================

  if (loading) {

    return (

      <div className="results-loading">

        جاري تحميل النتائج...

      </div>

    );

  }


  // ======================================
  // Page
  // ======================================

  return (

    <div className="my-results-page">


      {/* ==================================
          Header
      ================================== */}

      <div className="results-header">

        <div>

          <h1>
            🏆 نتائج الامتحانات
          </h1>

          <p>
            تابع مستواك الدراسي واعرف تقدمك
          </p>

        </div>


        <button
          onClick={() => navigate(-1)}
        >

          <FiArrowRight />

          العودة

        </button>

      </div>


      {/* ==================================
          Statistics
      ================================== */}

      <div className="results-stats">


        <div className="result-stat-card">

          <FiClipboard />

          <h2>
            {statistics.totalExams}
          </h2>

          <p>
            عدد الامتحانات
          </p>

        </div>


        <div className="result-stat-card">

          <FiTrendingUp />

          <h2>
            {statistics.averagePercentage}%
          </h2>

          <p>
            متوسط الدرجات
          </p>

        </div>


        <div className="result-stat-card">

          <FiAward />

          <h2>
            {statistics.highestPercentage}%
          </h2>

          <p>
            أفضل نتيجة
          </p>

        </div>


      </div>


      {/* ==================================
          Performance
      ================================== */}

      <div className="performance-box">

        <h2>
          مستوى الأداء
        </h2>


        <div className="circle-progress">

          <span>
            {statistics.averagePercentage}%
          </span>

        </div>


        <p>

          {statistics.averagePercentage >= 90

            ? "أداء رائع! استمر بنفس المستوى 🔥"

            : statistics.averagePercentage >= 70

            ? "مستوى جيد، حاول التطوير أكثر 👏"

            : "ركز على المراجعة وتحسين مستواك 📚"

          }

        </p>

      </div>


      {/* ==================================
          Results List
      ================================== */}

      <div className="results-list">

        <h2>
          كل النتائج
        </h2>


        {results.length === 0 ? (

          <div className="empty-results">

            لم تقم بحل أي امتحان حتى الآن

          </div>

        ) : (

          results.map((result) => {

            const status =
              getStatus(result.percentage);


            return (

              <div
                className="exam-result-card"
                key={result._id}
              >


                {/* ==================================
                    Top
                ================================== */}

                <div className="exam-result-top">

                  <div>

                    <h3>
                      {result.title}
                    </h3>

                    <span
                      className={status.class}
                    >
                      {status.text}
                    </span>

                  </div>

                </div>


                {/* ==================================
                    Details
                ================================== */}

                <div className="result-details">


                  <div>

                    الدرجة

                    <strong>

                      {result.score}

                      /

                      {result.totalMarks}

                    </strong>

                  </div>


                  <div>

                    النسبة

                    <strong>
                      {result.percentage}%
                    </strong>

                  </div>


                  <div>

                    التاريخ

                    <strong>

                      {result.finishedAt

                        ? new Date(
                            result.finishedAt
                          ).toLocaleDateString(
                            "ar-EG"
                          )

                        : "غير محدد"

                      }

                    </strong>

                  </div>


                </div>


                {/* ==================================
                    Details Button
                ================================== */}

                <button
                  onClick={() =>
                    navigate(
                      `/exam-result/${result.examId}`
                    )
                  }
                >

                  <FiEye />

                  عرض التفاصيل

                </button>


              </div>

            );

          })

        )}

      </div>


    </div>

  );

}