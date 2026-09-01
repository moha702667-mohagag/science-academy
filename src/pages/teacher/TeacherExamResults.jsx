import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiEye,
  FiAward,
  FiUsers
} from "react-icons/fi";

import api from "../../api/axios";

import "./TeacherExamResults.css";

export default function ExamResults() {

  const { examId } = useParams();

  const navigate = useNavigate();

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    loadResults();

  }, []);


  const loadResults = async () => {

    try {

      const res = await api.get(
        `/exam-attempt/exam/${examId}/results`
      );


      const data = res.data;

      console.log("RESULTS DATA:", data);


      if (data.success) {

        setResults(data.results);

      }


    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };


  if (loading) {

    return (

      <div className="results-loading">

        جاري تحميل النتائج...

      </div>

    );

  }


  return (

    <div className="exam-results-page">


      <div className="results-header">


        <div>

          <h1>

            📊 نتائج الطلاب

          </h1>


          <p>

            متابعة درجات الطلاب في الامتحان

          </p>

        </div>


        <button

          onClick={() => navigate(-1)}

        >

          <FiArrowRight />

          رجوع

        </button>


      </div>


      <div className="results-summary">


        <div>

          <FiUsers />

          <h2>

            {results.length}

          </h2>

          <p>

            عدد الطلاب

          </p>

        </div>


        <div>

          <FiAward />

          <h2>

            {

              results.length

                ?

                Math.max(
                  ...results.map(
                    item => item.percentage
                  )
                )

                :

                0

            }%

          </h2>

          <p>

            أعلى نتيجة

          </p>

        </div>


      </div>


      <div className="students-table">


        <div className="table-head">

          <span>
            الطالب
          </span>

          <span>
            الصف
          </span>

          <span>
            الدرجة
          </span>

          <span>
            النسبة
          </span>

          <span>
            الحالة
          </span>

          <span>
            إجراء
          </span>

        </div>


        {

          results.map(student => (

            <div

              className="table-row"

              key={student.studentId}

            >


              <span>

                {student.name}

              </span>


              <span>

                {student.grade}

              </span>


              <span>

                {student.score}

              </span>


              <span>

                {student.percentage}%

              </span>


              <span

                className={
                  student.status === "reviewed"
                    ? "reviewed"
                    : "waiting"
                }

              >

                {

                  student.status === "reviewed"

                    ?

                    "تم التصحيح"

                    :

                    "بانتظار التصحيح"

                }

              </span>


              <button

                onClick={() =>
                  navigate(
                    `/teacher/student-result/${student.attemptId}`
                  )
                }

              >

                <FiEye />

                عرض

              </button>


            </div>

          ))

        }


      </div>


    </div>

  );

}