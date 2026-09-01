import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiUser,
  FiPhone,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";

import api from "../../api/axios";

import "./TeacherStudents.css";

export default function TeacherStudents() {

  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedGrade, setSelectedGrade] = useState("all");

  const [search, setSearch] = useState("");


  useEffect(() => {

    loadStudents();

  }, []);


  const loadStudents = async () => {

    try {

      const res = await api.get(
        "/teacher/students"
      );

      const data = res.data;

      console.log("TEACHER STUDENTS:", data);

      if (data.success) {
        setStudents(data.students);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };


  const filteredStudents = students.filter((student) => {

    const gradeMatch =
      selectedGrade === "all" ||
      student.grade === selectedGrade;


    const searchValue = search.toLowerCase().trim();

    const searchMatch =
      !searchValue ||
      student.fullName?.toLowerCase().includes(searchValue) ||
      student.phone?.includes(searchValue);


    return gradeMatch && searchMatch;

  });


  const grades = [
    "الرابع الابتدائي",
    "الخامس الابتدائي",
    "السادس الابتدائي",
    "الأول الإعدادي",
    "الثاني الإعدادي",
    "الثالث الإعدادي",
  ];


  if (loading) {

    return (
      <div className="teacher-students-loading">
        جاري تحميل الطلاب...
      </div>
    );

  }


  return (

    <section className="teacher-students-page">

      <div className="teacher-students-container">


        {/* Header */}

        <div className="teacher-students-header">

          <div className="teacher-students-title">

            <div className="students-title-icon">
              <FiUsers />
            </div>

            <div>

              <h1>
                طلابي
              </h1>

              <p>
                متابعة وإدارة بيانات الطلاب والاطلاع على مستوى كل طالب
              </p>

            </div>

          </div>


          <button
            className="teacher-students-back"
            onClick={() => navigate(-1)}
          >

            <FiArrowRight />

            العودة

          </button>

        </div>


        {/* Statistics */}

        <div className="students-top-stat">

          <div>

            <span>
              إجمالي الطلاب
            </span>

            <strong>
              {students.length}
            </strong>

          </div>

          <FiUsers />

        </div>


        {/* Filters */}

        <div className="students-filters">

          <div className="students-search">

            <FiSearch />

            <input
              type="text"
              placeholder="ابحث باسم الطالب أو رقم الهاتف..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="students-grade-filter">

            <FiFilter />

            <select
              value={selectedGrade}
              onChange={(e) =>
                setSelectedGrade(e.target.value)
              }
            >

              <option value="all">
                كل الصفوف
              </option>

              {grades.map((grade) => (

                <option
                  key={grade}
                  value={grade}
                >
                  {grade}
                </option>

              ))}

            </select>

          </div>

        </div>


        {/* Table */}

        <div className="students-table-card">

          <div className="students-table-header">

            <h2>
              قائمة الطلاب
            </h2>

            <span>
              {filteredStudents.length} طالب
            </span>

          </div>


          {filteredStudents.length === 0 ? (

            <div className="no-students">

              <FiUsers />

              <h3>
                لا يوجد طلاب
              </h3>

              <p>
                لا توجد نتائج مطابقة للبحث أو الفلترة
              </p>

            </div>

          ) : (

            <div className="students-table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      الطالب
                    </th>

                    <th>
                      الصف
                    </th>

                    <th>
                      رقم الطالب
                    </th>

                    <th>
                      رقم ولي الأمر
                    </th>

                    <th>
                      الحالة
                    </th>

                    <th>
                      الإجراء
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map((student) => (

                    <tr key={student._id}>

                      <td>

                        <div className="student-table-name">

                          <div className="student-table-avatar">

                            {student.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || (
                                <FiUser />
                              )}

                          </div>

                          <div>

                            <strong>
                              {student.fullName}
                            </strong>

                            <span>
                              {student.email}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="student-grade-badge">
                          {student.grade || "غير محدد"}
                        </span>

                      </td>


                      <td>

                        <div className="student-phone">

                          <FiPhone />

                          {student.phone || "غير متوفر"}

                        </div>

                      </td>


                      <td>

                        {student.parentPhone || "غير متوفر"}

                      </td>


                      <td>

                        <span className="student-active-badge">
                          نشط
                        </span>

                      </td>


                      <td>

                        <button
                          className="open-student-dashboard"
                          onClick={() =>
                            navigate(
                              `/teacher/students/${student._id}/dashboard`
                            )
                          }
                        >

                          <FiBarChart2 />

                          فتح الداشبورد

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </section>

  );

}