import "./TeacherDashboard.css";
import { FaBookOpen, FaClipboardList, FaPenFancy, FaUserGraduate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";
import api from "../api/axios";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);

  const [statistics, setStatistics] = useState({
  students: 0,
  courses: 0,
  homeworks: 0,
  exams: 0
  });

  useEffect(() => {

  loadStatistics();

}, []);


const loadStatistics = async () => {
  try {

    const res = await api.get("/teacher/dashboard/stats");

    const data = res.data;

    console.log("DASHBOARD STATUS:", res.status);
    console.log("DASHBOARD DATA:", data);

    if (data.success) {
      setStatistics({
        students: data.statistics?.students ?? 0,
        courses: data.statistics?.courses ?? 0,
        homeworks: data.statistics?.homeworks ?? 0,
        exams: data.statistics?.exams ?? 0,
      });
    }

  } catch (error) {

    console.error(
      "LOAD STATISTICS ERROR:",
      error
    );

  }
};


useEffect(() => {
  const loadTeacher = async () => {
    try {
      const res = await api.get("/teacher");

      const data = res.data;

      console.log("Teacher Data:", data);

      if (data.success) {
        setTeacher(data.teacher);
      }
    } catch (error) {
      console.error("LOAD TEACHER ERROR:", error);
    }
  };

  loadTeacher();
}, []);


 const dashboardCards = [
  {
    title: "إضافة كورس",
    desc: "أضف شرح جديد أو فيديو أو ملف للطلاب",
    icon: <FaBookOpen />,
    path: "/teacher/courses",
  },

  {
    title: "إضافة واجب",
    desc: "أضف واجب جديد وحدد الصف والملاحظات",
    icon: <FaClipboardList />,
    path: "/teacher/homework",
  },

  {
    title: "إضافة امتحان",
    desc: "أنشئ امتحان جديد وحدد الدرجة والوقت",
    icon: <FaPenFancy />,
    path: "/teacher/exams",
  },

  {
    title: "تصحيح الأسئلة المقالية",
    desc: "راجع إجابات الطلاب وأضف الدرجات",
    icon: <FaPenFancy />,
    path: "/teacher/essay-review",
  },

  // ⭐ الكارت الجديد
  {
    title: "طلابي",
    desc: "عرض جميع الطلاب ومتابعة مستوى كل طالب",
    icon: <FaUserGraduate />,
    path: "/teacher/students",
  },

  {
    title: "طلبات تسجيل الطلاب",
    desc: "راجع طلبات إنشاء الحسابات واقبل أو ارفض الطلاب",
    icon: <FaUserGraduate />,
    path: "/teacher/pending-students",
  },
];

  return (
    <section className="teacher-dashboard">

      <div className="dashboard-top-bar">

        <button
          className="dashboard-home-btn"
          onClick={() => navigate("/")}
        >
          <FiHome />
          <span>الرئيسية</span>
        </button>

      </div>
      {
 
teacher && (

<div className="teacher-profile-card">
  


<div className="teacher-avatar">


{
teacher.name?.charAt(0)
}


</div>



<div className="teacher-info">


<div className="teacher-title">


<h2>
{teacher.name}
</h2>


<span>
{teacher.subject}
</span>


</div>



<p className="teacher-bio">

{
teacher.bio ||
"لم يتم إضافة نبذة عن المدرس بعد"
}

</p>



<div className="teacher-details">


<div>
📞 {teacher.phone}
</div>


<div>
✉️ {teacher.email}
</div>


</div>



<button

className="edit-profile-btn"

onClick={()=>navigate("/teacher/profile")}

>

تعديل البيانات

</button>



</div>


</div>

)
}
      <div className="teacher-header">
        <h1>لوحة تحكم المدرس</h1>
        <p>من هنا تقدر تضيف الكورسات والواجبات والامتحانات بشكل منظم وسريع</p>
      </div>
      <div className="teacher-stats">

<div>
  <h2>{statistics.courses}</h2>
  <p>الكورسات</p>
</div>

<div>
  <h2>{statistics.homeworks}</h2>
  <p>الواجبات</p>
</div>

<div>
  <h2>{statistics.exams}</h2>
  <p>الامتحانات</p>
</div>

<div>
  <h2>{statistics.students}</h2>
  <p>الطلاب</p>
</div>

      </div>

      <div className="teacher-cards">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="teacher-card"
            onClick={() => navigate(card.path)}
          >
            <div className="teacher-card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <button>فتح</button>
          </div>
        ))}
      </div>
    </section>
  );
}