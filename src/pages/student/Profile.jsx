import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

import {
  FaUserGraduate,
  FaPhone,
  FaUserFriends,
  FaMapMarkerAlt,
  FaEnvelope,
  FaBookOpen,
  FaSave,
  FaArrowRight
} from "react-icons/fa";

import api from "../../api/axios";


export default function Profile() {

  const navigate = useNavigate();


  // ======================================
  // State
  // ======================================

  const [formData, setFormData] = useState({

    fullName: "",
    email: "",
    phone: "",
    parentPhone: "",
    address: "",
    grade: ""

  });


  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");


  // ======================================
  // جلب البيانات
  // ======================================

  useEffect(() => {

    loadProfile();

  }, []);


  const loadProfile = async () => {

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
      // Get Profile
      // ======================================

      const res = await api.get(
        "/user/profile"
      );

      const data = res.data;


      console.log(
        "PROFILE DATA:",
        data
      );


      // ======================================
      // Success
      // ======================================

      if (!data.success) {

        setError(
          data.message ||
          "حدث خطأ أثناء تحميل البيانات"
        );

        return;

      }


      const user = data.user;


      setFormData({

        fullName: user.fullName || "",

        email: user.email || "",

        phone: user.phone || "",

        parentPhone: user.parentPhone || "",

        address: user.address || "",

        grade: user.grade || ""

      });


    } catch (error) {

      console.log(
        "LOAD PROFILE ERROR:",
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


      setError(
        error.response?.data?.message ||
        "حدث خطأ أثناء الاتصال بالسيرفر"
      );


    } finally {

      setLoading(false);

    }

  };


  // ======================================
  // تغيير البيانات
  // ======================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData((prev) => ({

      ...prev,

      [name]: value

    }));


    // إخفاء الرسائل

    setSuccess("");

    setError("");

  };


  // ======================================
  // حفظ البيانات
  // ======================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    setSaving(true);

    setSuccess("");

    setError("");


    try {

      const token =
        localStorage.getItem("token");


      // ======================================
      // No Token
      // ======================================

      if (!token) {

        navigate("/auth");

        return;

      }


      // ======================================
      // Update Profile
      // ======================================

      const res = await api.put(
        "/user/profile",
        {

          fullName:
            formData.fullName,

          phone:
            formData.phone,

          parentPhone:
            formData.parentPhone,

          address:
            formData.address

        }
      );


      const data = res.data;


      console.log(
        "UPDATE PROFILE:",
        data
      );


      // ======================================
      // Error From Backend
      // ======================================

      if (!data.success) {

        setError(
          data.message ||
          "حدث خطأ أثناء حفظ البيانات"
        );

        return;

      }


      // ======================================
      // تحديث البيانات في الصفحة
      // ======================================

      const user = data.user;


      setFormData({

        fullName:
          user.fullName || "",

        email:
          user.email || "",

        phone:
          user.phone || "",

        parentPhone:
          user.parentPhone || "",

        address:
          user.address || "",

        grade:
          user.grade || ""

      });


      // ======================================
      // تحديث user في localStorage
      // ======================================

      const oldUserString =
        localStorage.getItem("user");


      if (oldUserString) {

        const oldUser =
          JSON.parse(oldUserString);


        const updatedUser = {

          ...oldUser,

          fullName:
            user.fullName,

          phone:
            user.phone,

          parentPhone:
            user.parentPhone,

          address:
            user.address

        };


        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

      }


      setSuccess(
        "تم تحديث بياناتك بنجاح ✅"
      );


    } catch (error) {

      console.log(
        "UPDATE PROFILE ERROR:",
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


      setError(
        error.response?.data?.message ||
        "حدث خطأ أثناء الاتصال بالسيرفر"
      );


    } finally {

      setSaving(false);

    }

  };


  // ======================================
  // Loading
  // ======================================

  if (loading) {

    return (

      <div className="profile-loading">

        جاري تحميل بياناتك... ⏳

      </div>

    );

  }


  // ======================================
  // الصفحة
  // ======================================

  return (

    <div className="profile-page">

      <div className="profile-container">


        {/* =================================
            Header
        ================================= */}

        <div className="profile-header">

          <div>

            <h1>
              الملف الشخصي
            </h1>

            <p>
              تعديل وإدارة بياناتك الشخصية
            </p>

          </div>


          <button
            className="profile-back-btn"
            onClick={() => navigate(-1)}
          >

            <FaArrowRight />

            العودة

          </button>

        </div>


        {/* =================================
            Profile Card
        ================================= */}

        <div className="profile-card">


          {/* =================================
              Profile Top
          ================================= */}

          <div className="profile-top">

            <div className="profile-avatar">

              {formData.fullName

                ? formData.fullName.charAt(0)

                : "ط"

              }

            </div>


            <div className="profile-title">

              <h2>

                {formData.fullName ||
                  "الطالب"}

              </h2>

              <span>
                طالب
              </span>

            </div>

          </div>


          {/* =================================
              Messages
          ================================= */}

          {success && (

            <div className="profile-success">

              {success}

            </div>

          )}


          {error && (

            <div className="profile-error">

              {error}

            </div>

          )}


          {/* =================================
              Form
          ================================= */}

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >

            <div className="profile-form-grid">


              {/* الاسم */}

              <div className="profile-input-group">

                <label>

                  <FaUserGraduate />

                  اسم الطالب

                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="اكتب اسمك"
                  required
                />

              </div>


              {/* الإيميل */}

              <div className="profile-input-group">

                <label>

                  <FaEnvelope />

                  البريد الإلكتروني

                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />

                <small>
                  لا يمكن تعديل البريد الإلكتروني
                </small>

              </div>


              {/* رقم الطالب */}

              <div className="profile-input-group">

                <label>

                  <FaPhone />

                  رقم الطالب

                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="رقم الطالب"
                  required
                />

              </div>


              {/* ولي الأمر */}

              <div className="profile-input-group">

                <label>

                  <FaUserFriends />

                  رقم ولي الأمر

                </label>

                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="رقم ولي الأمر"
                />

              </div>


              {/* الصف */}

              <div className="profile-input-group">

                <label>

                  <FaBookOpen />

                  الصف الدراسي

                </label>

                <input
                  type="text"
                  value={formData.grade}
                  disabled
                />

                <small>
                  لا يمكن تعديل الصف الدراسي
                </small>

              </div>


              {/* العنوان */}

              <div className="profile-input-group full-width">

                <label>

                  <FaMapMarkerAlt />

                  العنوان

                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="اكتب عنوانك"
                />

              </div>


            </div>


            {/* =================================
                Buttons
            ================================= */}

            <div className="profile-actions">


              <button
                type="submit"
                className="save-profile-btn"
                disabled={saving}
              >

                <FaSave />

                {saving

                  ? "جاري الحفظ..."

                  : "حفظ التعديلات"

                }

              </button>


              <button
                type="button"
                className="cancel-profile-btn"
                onClick={() => navigate(-1)}
              >

                إلغاء

              </button>


            </div>


          </form>


        </div>

      </div>

    </div>

  );

}