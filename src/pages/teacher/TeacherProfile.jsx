import { useEffect, useState } from "react";
import "./TeacherProfile.css";

export default function TeacherProfile() {

  const [teacher, setTeacher] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");


  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch("/api/teacher", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

      .then(res => res.json())

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

      const token = localStorage.getItem("token");

      const res = await fetch(
        "/api/teacher/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(teacher)
        }
      );


      const data = await res.json();


      if (res.ok) {

        setMessage("تم حفظ البيانات بنجاح ✅");

      } else {

        setMessage(data.message);

      }


    } catch (error) {

      console.log(error);

      setMessage("حدث خطأ");

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
