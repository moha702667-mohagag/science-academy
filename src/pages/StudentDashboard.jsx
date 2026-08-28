import "./StudentDashboard.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  FaBookOpen,
  FaClipboardList,
  FaPenFancy,
  FaUserGraduate,
  FaPhone,
  FaMapMarkerAlt,
  FaUserFriends,
  FaChartLine,
  
} from "react-icons/fa";

import { FiHome } from "react-icons/fi";

export default function StudentDashboard() {

  const navigate = useNavigate();

  const { grade, studentId } = useParams();

  // هل الصفحة مفتوحة بواسطة المدرس؟
  const isTeacherView = Boolean(studentId);

  const [studentData, setStudentData] = useState(null);

  const loggedUser = JSON.parse(
    localStorage.getItem("user")
  );

  /*
  لو المدرس:
  user = الطالب اللي جاي من الـ API

  لو الطالب:
  user = الطالب المسجل حاليًا
  */

  const user = isTeacherView
    ? studentData?.student
    : loggedUser;


  // ==========================================
  // Progress
  // ==========================================

  const [progressData, setProgressData] = useState({

    attendance: 100,

    homework: 100,

    exam: 100

  });


  // ==========================================
  // Statistics
  // ==========================================

  const [progressStats, setProgressStats] = useState({

    courses: {
      completed: 0,
      total: 0
    },

    homeworks: {
      completed: 0,
      total: 0
    },

    exams: {
      completed: 0,
      total: 0
    }

  });


  // ==========================================
  // Load Dashboard
  // ==========================================

  useEffect(() => {

    if (isTeacherView) {

      loadTeacherStudentDashboard();

    } else {

      loadProgress();

    }

  }, [studentId]);


  // ==========================================
  // المدرس يشوف Dashboard الطالب
  // ==========================================

  const loadTeacherStudentDashboard = async () => {

    try {

      const res = await api.get(
        `/teacher/students/${studentId}/dashboard`
      );

      const data = res.data;


      console.log(
        "TEACHER STUDENT DASHBOARD:",
        data
      );


      if (data.success) {

        // بيانات الطالب
        setStudentData(data);


        // نسب التقدم
        setProgressData({

          attendance:
            data.progress?.attendance ?? 0,

          homework:
            data.progress?.homework ?? 0,

          exam:
            data.progress?.exam ?? 0

        });


        // الإحصائيات
        setProgressStats({

          courses:
            data.stats?.courses ?? {
              completed: 0,
              total: 0
            },

          homeworks:
            data.stats?.homeworks ?? {
              completed: 0,
              total: 0
            },

          exams:
            data.stats?.exams ?? {
              completed: 0,
              total: 0
            }

        });

      }

    } catch (error) {

      console.log(
        "TEACHER STUDENT DASHBOARD ERROR:",
        error
      );

    }

  };


  // ==========================================
  // الطالب يشوف Dashboard بتاعه
  // ==========================================

  const loadProgress = async () => {

    try {

      const res = await api.get("/progress/dashboard");

      const data = res.data;


      console.log(
        "DASHBOARD PROGRESS:",
        data
      );


      if (data.success) {

        setProgressData({

          attendance:
            data.attendance ?? 0,

          homework:
            data.homework ?? 0,

          exam:
            data.exam ?? 0

        });


        setProgressStats(

          data.stats ?? {

            courses: {
              completed: 0,
              total: 0
            },

            homeworks: {
              completed: 0,
              total: 0
            },

            exams: {
              completed: 0,
              total: 0
            }

          }

        );

      }

    } catch (error) {

      console.log(error);

    }

  };


  // ==========================================
  // Loading للمدرس
  // ==========================================

  if (isTeacherView && !studentData) {

    return (

      <div className="student-dashboard">

        <div className="student-dashboard-container">

          <p>
            جاري تحميل بيانات الطالب...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // لو مفيش User
  // ==========================================

  if (!user) {

    return (

      <div className="student-dashboard">
        
        <div className="student-dashboard-container">

          <p>
            لا يوجد بيانات طالب.
            من فضلك قم بتسجيل الدخول أولًا.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // نسب الأداء
  // ==========================================

  const stats = [

    {
      title: "نسبة الحضور",

      value:
        progressData.attendance,

      count:
        `${progressStats.courses.completed} / ${progressStats.courses.total} كورسات`
    },

    {
      title: "نسبة الواجبات",

      value:
        progressData.homework,

      count:
        `${progressStats.homeworks.completed} / ${progressStats.homeworks.total} واجبات`
    },

    {
      title: "نسبة الامتحانات",

      value:
        progressData.exam,

      count:
        `${progressStats.exams.completed} / ${progressStats.exams.total} امتحانات`
    }

  ];


  // ==========================================
  // كروت الطالب
  // ==========================================

  const studentCards = [

    {
      title: "الكورسات",

      desc: "جميع الكورسات الخاصة بصفك",

      icon: <FaBookOpen />,

      path:
        `/class/${user.grade || grade}/courses`

    },

    {
      title: "الواجبات",

      desc: "حل الواجبات",

      icon: <FaClipboardList />,

      path:
        `/class/${user.grade || grade}/homeworks`

    },

    {
      title: "الامتحانات",

      desc: "اختبر نفسك بس بلاش غش",

      icon: <FaPenFancy />,

      path:
        `/class/${user.grade || grade}/exams`

    },

    {
      title: "النتائج",

      desc: "نتائج الامتحانات",

      icon: <FaChartLine />,

      path:
        `/class/${user.grade || grade}/my-results`

    },

    {
      title: "الملف الشخصي",

      desc: "تعديل بياناتك الشخصية ",

      icon: <FaUserGraduate />,

      path:
        `/class/${user.grade || grade}/profile`

    }

  ];


  return (

    <section className="student-dashboard">

      <div className="dashboard-top-bar">

          <button
            className="dashboard-home-btn"
            onClick={() => navigate("/")}
          >
            <FiHome />
            <span>الرئيسية</span>
          </button>

        </div>

      <div className="student-dashboard-container">
        


        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}

        {/* ================================= */}
{/* Student Profile */}
{/* ================================= */}

<div className="teacher-profile-card">

  {/* Avatar */}

  <div className="teacher-avatar">

    {user.fullName?.charAt(0) || "ط"}

  </div>


  {/* معلومات الطالب */}

  <div className="teacher-info">

    <div className="teacher-title">

      <div>

        <h2>
          {user.fullName || "اسم الطالب"}
        </h2>

        <span>
          {user.grade || grade || "الصف غير محدد"}
        </span>

      </div>

    </div>


    {/* نبذة */}

    <p className="teacher-bio">

      {isTeacherView

        ? "بيانات ومتابعة الطالب داخل المنصة"

        : "بياناتك الشخصية داخل منصة مستر أحمد حجاج"

      }

    </p>


    {/* ================================= */}
    {/* بيانات الطالب */}
    {/* ================================= */}

    <div className="teacher-details">


      {/* رقم الطالب */}

      <div>

        📞

        <strong>
          رقم الطالب:
        </strong>

        {user.phone || "غير متوفر"}

      </div>


      {/* ولي الأمر */}

      <div>

        👨‍👩‍👦

        <strong>
          ولي الأمر:
        </strong>

        {user.parentPhone || "غير متوفر"}

      </div>


      {/* العنوان */}

      <div>

        📍

        <strong>
          العنوان:
        </strong>

        {user.address || "غير متوفر"}

      </div>


      {/* الصف */}

      <div>

        🏫

        <strong>
          الصف:
        </strong>

        {user.grade || grade || "غير متوفر"}

      </div>


      {/* البريد الإلكتروني */}

      <div>

        ✉️

        <strong>
          البريد الإلكتروني:
        </strong>

        {user.email || "غير متوفر"}

      </div>


    </div>


    {/* زر تعديل البيانات */}

    {!isTeacherView && (

      <button

        className="edit-profile-btn"

          onClick={() => navigate(`/class/${grade}/profile`)}


      >

        تعديل البيانات

      </button>

    )}


  </div>

</div>



        {/* ================================= */}
        {/* مستوى الطالب */}
        {/* ================================= */}

        <div className="student-progress-card">

          <h2>
            مستوى الطالب
          </h2>


          <div className="progress-list">

            {stats.map((item, index) => (

              <div
                className="progress-item"
                key={index}
              >

                <div className="progress-top">


                  <div>

                    <span>
                      {item.title}
                    </span>


                    <p className="progress-count">

                      {item.count}

                    </p>

                  </div>


                  <span>

                    {item.value}%

                  </span>


                </div>


                <div className="progress-bar">

                  <div

                    className="progress-fill"

                    style={{
                      width: `${item.value}%`
                    }}

                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* ================================= */}
        {/* الكروت */}
        {/* ================================= */}

        {!isTeacherView && (

          <div className="student-sections">

            {studentCards.map((card, index) => (

              <div

                className="student-section-card"

                key={index}

                onClick={() =>
                  navigate(card.path)
                }

              >

                <div className="student-section-icon">

                  {card.icon}

                </div>


                <h3>
                  {card.title}
                </h3>


                <p>
                  {card.desc}
                </p>


                <button>
                  فتح
                </button>

              </div>

            ))}

          </div>

        )}


        {/* ================================= */}
        {/* رسالة للمدرس */}
        {/* ================================= */}

        {isTeacherView && (

          <div className="teacher-dashboard-note">

            <FaChartLine />

            <div>

              <h3>
                متابعة الطالب
              </h3>

              <p>
                يمكنك من خلال هذه الصفحة متابعة
                إنجاز الطالب للكورسات والواجبات
                والامتحانات ونسب تقدمه.
              </p>

            </div>

          </div>

        )}

      </div>

    </section>

  );

}