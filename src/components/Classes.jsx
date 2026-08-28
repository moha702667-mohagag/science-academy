import "./Classes.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

import grade4 from "../assets/classes/grade-4.webp.jfif";
import grade5 from "../assets/classes/grade-5.webp.jfif";
import grade6 from "../assets/classes/grade-6.webp.jfif";

import grade1Prep from "../assets/classes/grade-1-prep.webp.jfif";
import grade2Prep from "../assets/classes/grade-2-prep.webp.jfif";
import grade3Prep from "../assets/classes/grade-3-prep.webp.jfif";

import grade1Secondary from "../assets/classes/grade-1-secondary.webp.jfif";

export default function Classes() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);

  // ==========================================
  // CLASS IMAGES
  // ==========================================

  const classImages = {
    "الرابع الابتدائي": grade4,
    "الخامس الابتدائي": grade5,
    "السادس الابتدائي": grade6,

    "الأول الإعدادي": grade1Prep,
    "الثاني الإعدادي": grade2Prep,
    "الثالث الإعدادي": grade3Prep,

    "الأول الثانوي": grade1Secondary,
  };

  // ==========================================
  // FETCH CLASSES
  // ==========================================

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/classes");

        setClasses(res.data);
      } catch (err) {
        console.log("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, []);

  // ==========================================
  // ENTER CLASS
  // ==========================================

  const handleClassEnter = (grade) => {
    const storedUser = localStorage.getItem("user");

    const user = storedUser
      ? JSON.parse(storedUser)
      : null;

    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!user) {
      localStorage.setItem(
        "redirectAfterLogin",
        `/class/${grade}`
      );

      navigate("/auth");

      return;
    }

    // ==========================================
    // TEACHER
    // ==========================================

    if (user.role === "teacher") {
      navigate(`/class/${grade}`);

      return;
    }

    // ==========================================
    // STUDENT
    // ==========================================

    if (user.role === "student") {
      if (user.grade !== grade) {
        alert(`أنت مسجل في صف: ${user.grade} فقط`);
        return;
      }

      navigate(`/class/${grade}`);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="classes-section">

      <div className="classes-header">
        <span className="classes-eyebrow">
          SCIENCE ACADEMY
        </span>

        <h2 className="title">
          الصفوف الدراسية
        </h2>

        <p className="classes-description">
          اختر الصف الدراسي للوصول إلى المحتوى
          التعليمي الخاص بك.
        </p>
      </div>

      <div className="classes-grid">

        {classes.map((item) => {

          const image = classImages[item.name];

          return (
            <div
              className="class-card"
              key={item._id}
            >

              {/* ==================================
                  IMAGE
              ================================== */}

              <div className="class-image-wrapper">

                {image ? (
                  <img
                    className="class-image"
                    src={image}
                    alt={item.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="class-image-fallback">
                    <span>
                      {item.name}
                    </span>
                  </div>
                )}

                <div className="class-image-overlay" />

                <div className="class-number">
                  {item.name.includes("الرابع")
                    ? "4"
                    : item.name.includes("الخامس")
                    ? "5"
                    : item.name.includes("السادس")
                    ? "6"
                    : item.name.includes("الأول الإعدادي")
                    ? "1"
                    : item.name.includes("الثاني الإعدادي")
                    ? "2"
                    : item.name.includes("الثالث الإعدادي")
                    ? "3"
                    : item.name.includes("الأول الثانوي")
                    ? "1"
                    : ""}
                </div>

              </div>

              {/* ==================================
                  CARD CONTENT
              ================================== */}

              <div className="class-content">

                <span className="class-label">
                  الصف الدراسي
                </span>

                <h3>
                  {item.name}
                </h3>

                <button
                  className="class-btn"
                  onClick={() =>
                    handleClassEnter(item.name)
                  }
                >
                  <span>
                    دخول الصف
                  </span>

                  <span className="class-btn-arrow">
                    ←
                  </span>
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}