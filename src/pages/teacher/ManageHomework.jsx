import { useEffect, useState } from "react";

import {
  FiPlus,
  FiBookOpen,
  FiLink,
  FiCalendar,
  FiLayers,
  FiArrowRight,
} from "react-icons/fi";

import { motion } from "framer-motion";

import "./ManageHomework.css";

export default function ManageHomework() {
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [homeworks, setHomeworks] = useState([]);

  const [editId, setEditId] = useState(null);

  const [filterClass, setFilterClass] = useState("");

  const [homework, setHomework] = useState({
    title: "",
    classId: "",
    description: "",
    formUrl: "",
    dueDate: "",
  });

  useEffect(() => {
    loadClasses();
    loadHomeworks();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes");

      const data = await res.json();

      setClasses(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadHomeworks = async () => {
    try {
      const res = await fetch("/api/homeworks/teacher", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setHomeworks(data);

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setHomework({
      ...homework,
      [e.target.name]: e.target.value,
    });
  };

  const submitHomework = async (e) => {
    e.preventDefault();

    if (!homework.classId) {
      alert("اختر الصف الدراسي");
      return;
    }

    if (!homework.formUrl) {
      alert("أدخل رابط Microsoft Forms");
      return;
    }

    setLoading(true);

    // ==============================
    // EDIT HOMEWORK
    // ==============================

    if (editId) {
      try {
        const res = await fetch(
          `/api/homeworks/${editId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(homework),
          }
        );

        const data = await res.json();

        if (data.success) {
          alert("تم تعديل الواجب");

          loadHomeworks();

          setEditId(null);

          setHomework({
            title: "",
            classId: "",
            description: "",
            formUrl: "",
            dueDate: "",
          });
        }
      } catch (error) {
        console.log(error);
      }

      setLoading(false);

      return;
    }

    // ==============================
    // ADD HOMEWORK
    // ==============================

    try {
      const res = await fetch(
        "/api/homeworks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(homework),
        }
      );

      const data = await res.json();

      console.log(data);

      if (data.success) {
        alert("تم نشر الواجب بنجاح");

        loadHomeworks();

        setHomework({
          title: "",
          classId: "",
          description: "",
          formUrl: "",
          dueDate: "",
        });
      } else {
        alert(data.message || "حدث خطأ");
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const deleteHomework = async (id) => {
    if (!window.confirm("هل تريد حذف الواجب؟")) return;

    try {
      const res = await fetch(
        `/api/homeworks/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("تم حذف الواجب");

        loadHomeworks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const editHomework = (item) => {
    setEditId(item._id);

    setHomework({
      title: item.title,

      classId:
        item.classId?._id || "",

      description:
        item.description || "",

      formUrl:
        item.formUrl,

      dueDate:
        item.dueDate
          ? item.dueDate.slice(0, 10)
          : "",
    });
  };

  return (
    <motion.div
      className="manage-homework"

      initial={{
        opacity: 0,
        y: 40,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.5,
      }}
    >

      {/* ==============================
          HEADER
      ============================== */}

      <div className="homework-header">

        <div className="homework-header-title">

          <div className="homework-header-icon">
            <FiBookOpen />
          </div>

          <div>

            <h1>
              إدارة الواجبات
            </h1>

            <p>
              أضف ونظم واجبات Microsoft Forms لطلابك بسهولة
            </p>

          </div>

        </div>

        <button
          className="homework-back-btn"
          onClick={() => window.history.back()}
        >
          <FiArrowRight />

          <span>
            رجوع
          </span>

        </button>

      </div>


      {/* ==============================
          FORM
      ============================== */}

      <form onSubmit={submitHomework}>

        <label>
          عنوان الواجب
        </label>

        <input
          name="title"
          placeholder="مثال : واجب الوحدة الأولى"
          value={homework.title}
          onChange={handleChange}
        />


        <label>

          <FiLayers />

          الصف الدراسي

        </label>

        <select
          name="classId"
          value={homework.classId}
          onChange={handleChange}
        >

          <option value="">
            اختر الصف الدراسي
          </option>

          {classes.map((item) => (

            <option
              key={item._id}
              value={item._id}
            >
              {item.name}
            </option>

          ))}

        </select>


        <label>
          وصف الواجب
        </label>

        <textarea
          name="description"
          placeholder="اكتب وصفاً مختصراً للواجب..."
          value={homework.description}
          onChange={handleChange}
        />


        <label>

          <FiLink />

          رابط Microsoft Forms

        </label>

        <input
          name="formUrl"
          type="url"
          placeholder="https://forms.office.com/..."
          value={homework.formUrl}
          onChange={handleChange}
        />


        <label>

          <FiCalendar />

          آخر موعد للتسليم

        </label>

        <input
          type="date"
          name="dueDate"
          value={homework.dueDate}
          onChange={handleChange}
        />


        <button
          className="save-homework"
          disabled={loading}
        >

          <FiPlus />

          {
            loading
              ? "جاري الحفظ..."
              : editId
                ? "حفظ التعديل"
                : "نشر الواجب"
          }

        </button>

      </form>


      {/* ==============================
          FILTER
      ============================== */}

      <div className="filter-box">

        <label>
          عرض حسب الصف
        </label>

        <select
          value={filterClass}
          onChange={(e) =>
            setFilterClass(e.target.value)
          }
        >

          <option value="">
            كل الصفوف
          </option>

          {classes.map(item => (

            <option
              key={item._id}
              value={item._id}
            >
              {item.name}
            </option>

          ))}

        </select>

      </div>


      {/* ==============================
          HOMEWORK GRID
      ============================== */}

      <div className="homework-grid">

        {
          homeworks

            .filter(item => {

              if (!filterClass) return true;

              return (
                item.classId?._id ===
                filterClass
              );

            })

            .map(item => (

              <div
                className="homework-card"
                key={item._id}
              >

                <div className="homework-top">

                  <span className="grade-badge">

                    📚 {item.classId?.name}

                  </span>

                </div>


                <h3>
                  {item.title}
                </h3>


                <p>
                  {item.description || "لا يوجد وصف"}
                </p>


                <p>

                  📅

                  {
                    item.dueDate
                      ? new Date(
                          item.dueDate
                        ).toLocaleDateString("ar-EG")
                      : "بدون موعد"
                  }

                </p>


                <a
                  href={item.formUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="open-homework"
                >
                  فتح Microsoft Forms
                </a>


                <div className="homework-actions">

                  <button
                    onClick={() =>
                      editHomework(item)
                    }
                  >
                    ✏️ تعديل
                  </button>


                  <button
                    onClick={() =>
                      deleteHomework(item._id)
                    }
                  >
                    🗑 حذف
                  </button>

                </div>

              </div>

            ))
        }

      </div>

    </motion.div>
  );
}
