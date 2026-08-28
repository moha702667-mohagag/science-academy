import { useEffect, useState } from "react";

import {
  FiBookOpen,
  FiVideo,
  FiPlus,
  FiLayers,
  FiArrowRight
} from "react-icons/fi";

import { motion } from "framer-motion";

import "./ManageCourses.css";

import api from "../../api/axios";


export default function ManageCourses() {

  const [courses, setCourses] = useState([]);

  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [filterGrade, setFilterGrade] = useState("all");


  const [course, setCourse] = useState({

    title: "",
    classId: "",
    description: "",
    videoUrl: ""

  });


  const [editId, setEditId] = useState(null);


  // ======================================
  // Load Data
  // ======================================

  useEffect(() => {

    fetchCourses();

    fetchClasses();

  }, []);


  // ======================================
  // Fetch Classes
  // ======================================

  const fetchClasses = async () => {

    try {

      const res = await api.get(
        "/classes"
      );

      const data = res.data;

      console.log(
        "CLASSES DATA:",
        data
      );

      setClasses(data);

    } catch (error) {

      console.log(
        "LOAD CLASSES ERROR:",
        error
      );

    }

  };


  // ======================================
  // Fetch Courses
  // ======================================

  const fetchCourses = async () => {

    try {

      const res = await api.get(
        "/courses"
      );

      const data = res.data;

      console.log(
        "COURSES DATA:",
        data
      );

      setCourses(data);

    } catch (error) {

      console.log(
        "LOAD COURSES ERROR:",
        error
      );

    }

  };


  // ======================================
  // Filter
  // ======================================

  const filteredCourses =
    filterGrade === "all"
      ? courses
      : courses.filter(
          (item) =>
            item.classId?.name === filterGrade
        );


  // ======================================
  // Handle Change
  // ======================================

  const handleChange = (e) => {

    setCourse({

      ...course,

      [e.target.name]: e.target.value

    });

  };


  // ======================================
  // Add / Update Course
  // ======================================

  const addCourse = async (e) => {

    e.preventDefault();


    console.log(
      "DATA BEFORE SEND:",
      course
    );


    if (!course.classId) {

      alert(
        "اختر الصف الدراسي أولا"
      );

      return;

    }


    setLoading(true);


    try {

      let res;


      // ==================================
      // Update
      // ==================================

      if (editId) {

        res = await api.put(
          `/courses/${editId}`,
          course
        );

      }

      // ==================================
      // Create
      // ==================================

      else {

        res = await api.post(
          "/courses",
          course
        );

      }


      const data = res.data;


      console.log(
        "COURSE RESPONSE:",
        data
      );


      if (data.success) {

        setCourse({

          title: "",
          classId: "",
          description: "",
          videoUrl: ""

        });

        setEditId(null);

        fetchCourses();

      }

    } catch (error) {

      console.log(
        "SAVE COURSE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "حدث خطأ أثناء حفظ الكورس"
      );

    } finally {

      setLoading(false);

    }

  };


  // ======================================
  // Edit Course
  // ======================================

  const editCourse = (item) => {

    setCourse({

      title: item.title,

      classId: item.classId?._id || "",

      description: item.description || "",

      videoUrl: item.videoUrl || ""

    });


    setEditId(
      item._id
    );

  };


  // ======================================
  // Delete Course
  // ======================================

  const deleteCourse = async (id) => {

    const confirmDelete =
      window.confirm(
        "هل تريد حذف الكورس؟"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      await api.delete(
        `/courses/${id}`
      );


      fetchCourses();

    } catch (error) {

      console.log(
        "DELETE COURSE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "حدث خطأ أثناء حذف الكورس"
      );

    }

  };


  // ======================================
  // Render
  // ======================================

  return (

    <div className="course-dashboard">


      {/* ==================================
          Header
      ================================== */}

      <motion.div
        className="page-header"

        initial={{
          opacity: 0,
          y: -40
        }}

        animate={{
          opacity: 1,
          y: 0
        }}
      >

        <div className="header-content">

          <div className="header-title">

            <div className="header-icon">

              <FiBookOpen />

            </div>


            <div>

              <h1>
                إدارة الكورسات
              </h1>

              <p>
                أضف ونظم المحتوى التعليمي للطلاب بسهولة
              </p>

            </div>

          </div>


          <button
            type="button"
            className="back-btn"
            onClick={() =>
              window.history.back()
            }
          >

            <FiArrowRight />

            <span>
              رجوع
            </span>

          </button>

        </div>

      </motion.div>



      <div className="course-layout">


        {/* ==================================
            Add / Edit Course
        ================================== */}

        <motion.div

          className="add-card"

          initial={{
            opacity: 0,
            x: -60
          }}

          animate={{
            opacity: 1,
            x: 0
          }}

        >

          <h2>

            <FiPlus />

            {editId
              ? "تعديل الكورس"
              : "إضافة كورس جديد"
            }

          </h2>


          <form
            onSubmit={addCourse}
          >


            <label>
              اسم الكورس
            </label>


            <input

              name="title"

              value={course.title}

              onChange={handleChange}

              placeholder="مثال: شرح الوحدة الأولى"

            />


            <label>
              اختر الصف الدراسي
            </label>


            <div className="select-box">

              <FiLayers />


              <select

                name="classId"

                value={course.classId}

                onChange={handleChange}

              >

                <option
                  value=""
                >
                  اختر الصف الدراسي
                </option>


                {classes.map(
                  (item) => (

                    <option

                      key={item._id}

                      value={item._id}

                    >
                      {item.name}
                    </option>

                  )
                )}

              </select>

            </div>


            <label>
              وصف الكورس
            </label>


            <textarea

              name="description"

              value={course.description}

              onChange={handleChange}

              placeholder="اكتب وصف الكورس..."

            />


            <label>
              رابط الفيديو
            </label>


            <input

              name="videoUrl"

              value={course.videoUrl}

              onChange={handleChange}

              placeholder="https://youtube.com/"

            />


            <button

              disabled={loading}

              className="publish-btn"

            >

              {loading

                ? "جاري الحفظ..."

                :

                <>

                  <FiPlus />

                  {editId
                    ? "تحديث الكورس"
                    : "نشر الكورس"
                  }

                </>

              }

            </button>


          </form>

        </motion.div>



        {/* ==================================
            Courses List
        ================================== */}

        <motion.div

          className="list-card"

          initial={{
            opacity: 0,
            x: 60
          }}

          animate={{
            opacity: 1,
            x: 0
          }}

        >


          <h2>
            📚 الكورسات المنشورة
          </h2>


          <div className="filter-box">

            <label>
              فلترة حسب الصف:
            </label>


            <select

              value={filterGrade}

              onChange={(e) =>
                setFilterGrade(
                  e.target.value
                )
              }

            >

              <option value="all">
                كل الصفوف
              </option>


              {classes.map(
                (item) => (

                  <option

                    key={item._id}

                    value={item.name}

                  >
                    {item.name}
                  </option>

                )
              )}

            </select>

          </div>



          {courses.length === 0 ? (

            <div className="empty">

              لا يوجد كورسات حاليا

            </div>

          ) : (

            <div className="course-grid">

              {filteredCourses.map(
                (item) => (

                  <div
                    className="course-box"
                    key={item._id}
                  >

                    <div className="course-icon">
                      📘
                    </div>


                    <h3>
                      {item.title}
                    </h3>


                    <span>
                      📚 الصف: {item.classId?.name}
                    </span>


                    <p>
                      {item.description}
                    </p>


                    {item.videoUrl && (

                      <a

                        href={item.videoUrl}

                        target="_blank"

                        rel="noreferrer"

                      >

                        <FiVideo />

                        مشاهدة الدرس

                      </a>

                    )}


                    <div className="course-actions">


                      <button
                        onClick={() =>
                          editCourse(item)
                        }
                      >
                        ✏️ تعديل
                      </button>


                      <button
                        onClick={() =>
                          deleteCourse(
                            item._id
                          )
                        }
                      >
                        🗑 حذف
                      </button>


                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </motion.div>

      </div>

    </div>

  );

}
