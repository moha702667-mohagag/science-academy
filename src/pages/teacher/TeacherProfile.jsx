import { useEffect, useState } from "react";
import "./TeacherProfile.css";
import api from "../../api/axios";

export default function TeacherProfile() {

  const [teacher, setTeacher] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");


  useEffect(() => {

    api
      .get("/teacher")

      .then(res => res.data)

      .then(data => {
        setTeacher(data);
      })

      .catch(err => console.log(err));

  }, []);


  const handleChange = (e) => {

    setTeacher({
      ...teacher,
      [e.target.name]: e.target.value
    });

  };


  const handleSave = async () => {

    try {

      setLoading(true);

      const res = await api.put(
        "/teacher/profile",
        teacher
      );


      const data = res.data;


      if (res.status >= 200 && res.status < 300) {

        setMessage("تم حفظ البيانات بنجاح ✅");

      } else {

        setMessage(data.message);

      }


    } catch (error) {

      console.log(error);

      setMessage(
        error.response?.data?.message ||
        "حدث خطأ"
      );

    } finally {

      setLoading(false);

    }

  };


  if (!teacher) {

    return <h2>جاري تحميل البيانات...</h2>;

  }


  return (

    <div className="teacher-profile-container">

      <h1>
        بيانات المدرس
      </h1>


      <div className="profile-card">


        <div className="teacher-avatar">

          {
            teacher.name?.charAt(0)
          }

        </div>


        <div className="form-section">


          <div>

            <label>
              اسم المدرس
            </label>

            <input
              name="name"
              value={teacher.name || ""}
              onChange={handleChange}
            />

          </div>


          <div>

            <label>
              المادة
            </label>

            <input
              name="subject"
              value={teacher.subject || ""}
              onChange={handleChange}
            />

          </div>


          <div>

            <label>
              رقم الهاتف
            </label>

            <input
              name="phone"
              value={teacher.phone || ""}
              onChange={handleChange}
            />

          </div>


          <div>

            <label>
              الإيميل
            </label>

            <input
              name="email"
              value={teacher.email || ""}
              onChange={handleChange}
            />

          </div>


          <div className="full">

            <label>
              نبذة عن المدرس
            </label>

            <textarea
              name="bio"
              value={teacher.bio || ""}
              onChange={handleChange}
            />

          </div>


          <button
            onClick={handleSave}
            disabled={loading}
          >

            {
              loading
                ? "جاري الحفظ..."
                : "حفظ التعديلات"
            }

          </button>


          {
            message &&

            <p className="success-message">
              {message}
            </p>
          }


        </div>

      </div>

    </div>

  );

}