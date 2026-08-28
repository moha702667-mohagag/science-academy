import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useToast from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

import {
  FiPlus,
  FiBookOpen,
  FiCalendar,
  FiLayers,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";

import { motion } from "framer-motion";

import "./ManageExams.css";

import api from "../../api/axios";


// ==================================================
// MANAGE EXAMS
// ==================================================

export default function ManageExams() {

  const token = localStorage.getItem("token");

  const navigate = useNavigate();


  // ==================================================
  // STATE
  // ==================================================

  const [classes, setClasses] = useState([]);

  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);

  const [filterClass, setFilterClass] = useState("");


  // ==================================================
  // TOAST
  // ==================================================

  const {
    toast,
    success,
    error: toastError,
    warning,
    info,
    confirm,
    closeToast,
  } = useToast();


  // ==================================================
  // EMPTY EXAM
  // ==================================================

  const emptyExam = {
    title: "",
    classId: "",
    description: "",
    duration: "",
    passingMarks: "",
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultImmediately: true,
    examDate: "",
  };


  const [exam, setExam] = useState(emptyExam);


  // ==================================================
  // LOAD
  // ==================================================

  useEffect(() => {

    loadClasses();

    loadExams();

  }, []);


  // ==================================================
  // LOAD CLASSES
  // ==================================================

  const loadClasses = async () => {

    try {

      const res = await api.get("/classes");

      const data = res.data;


      if (!res.status || res.status < 200 || res.status >= 300) {

        throw new Error(
          data.message ||
          "تعذر تحميل الصفوف الدراسية"
        );

      }


      setClasses(data);


    } catch (err) {

      console.log(err);


      toastError(
        err.response?.data?.message ||
        "تعذر تحميل الصفوف الدراسية. حاول تحديث الصفحة.",
        "خطأ في تحميل الصفوف"
      );

    }

  };


  // ==================================================
  // LOAD EXAMS
  // ==================================================

  const loadExams = async () => {

    try {

      const res = await api.get("/exams");

      const data = res.data;


      if (data.success) {

        setExams(data.exams || []);

      } else {

        setExams(
          Array.isArray(data)
            ? data
            : []
        );

      }


    } catch (err) {

      console.log(err);


      toastError(
        err.response?.data?.message ||
        "تعذر تحميل الامتحانات. حاول تحديث الصفحة.",
        "خطأ في تحميل الامتحانات"
      );

    }

  };


  // ==================================================
  // HANDLE CHANGE
  // ==================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setExam((prev) => ({

      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  };


  // ==================================================
  // SUBMIT EXAM
  // ==================================================

  const submitExam = async (e) => {

    e.preventDefault();


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!exam.title.trim()) {

      warning(
        "من فضلك اكتب عنوان الامتحان أولًا.",
        "عنوان الامتحان مطلوب"
      );

      return;

    }


    if (!exam.classId) {

      warning(
        "من فضلك اختر الصف الدراسي أولًا.",
        "الصف الدراسي مطلوب"
      );

      return;

    }


    if (!exam.duration || Number(exam.duration) <= 0) {

      warning(
        "من فضلك أدخل مدة صحيحة للامتحان.",
        "مدة الامتحان مطلوبة"
      );

      return;

    }


    setLoading(true);


    try {

      const dataToSend = {

        ...exam,

        duration:
          Number(exam.duration),

        passingMarks:
          Number(exam.passingMarks || 0),

        maxAttempts:
          Number(exam.maxAttempts || 1),

      };


      let res;


      if (editId) {

        res = await api.put(
          `/exams/${editId}`,
          dataToSend
        );

      } else {

        res = await api.post(
          "/exams",
          dataToSend
        );

      }


      const data = res.data;


      if (!data.success) {

        throw new Error(
          data.message ||
          "تعذر حفظ الامتحان"
        );

      }


      // ==================================================
      // SUCCESS
      // ==================================================

      success(

        editId

          ? "تم تحديث بيانات الامتحان بنجاح."

          : "تم إنشاء الامتحان بنجاح.",

        editId

          ? "تم تعديل الامتحان"

          : "تم إنشاء الامتحان"

      );


      // ==================================================
      // NEW EXAM
      // ==================================================

      if (!editId) {

        setExam(emptyExam);

        setEditId(null);

        await loadExams();


        navigate(
          `/teacher/exams/${data.exam._id}/questions`
        );


        return;

      }


      // ==================================================
      // EDIT
      // ==================================================

      setEditId(null);

      setExam(emptyExam);

      await loadExams();


    } catch (err) {

      console.log(err);


      toastError(
        err.response?.data?.message ||
        err.message ||
        "حدث خطأ أثناء حفظ الامتحان.",
        "فشل حفظ الامتحان"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // DELETE EXAM
  // ==================================================

  const deleteExam = (id) => {

    confirm({

      title: "حذف الامتحان",

      message:
        "هل أنت متأكد من حذف هذا الامتحان؟\nسيتم حذف بياناته ولن تتمكن من استعادتها.",

      confirmText:
        "نعم، احذف الامتحان",

      cancelText:
        "إلغاء",

      onConfirm: async () => {

        try {

          const res = await api.delete(
            `/exams/${id}`
          );


          const data = res.data;


          if (!data.success) {

            throw new Error(
              data.message ||
              "تعذر حذف الامتحان"
            );

          }


          success(
            "تم حذف الامتحان بنجاح.",
            "تم حذف الامتحان"
          );


          await loadExams();


        } catch (err) {

          console.log(err);


          toastError(
            err.response?.data?.message ||
            err.message ||
            "حدث خطأ أثناء حذف الامتحان.",
            "فشل الحذف"
          );

        }

      },

    });

  };


  // ==================================================
  // EDIT EXAM
  // ==================================================

  const editExam = (item) => {

    setEditId(item._id);


    setExam({

      title:
        item.title || "",

      classId:
        item.classId?._id || "",

      description:
        item.description || "",

      duration:
        item.duration || "",

      passingMarks:
        item.passingMarks || "",

      maxAttempts:
        item.maxAttempts || 1,

      shuffleQuestions:
        item.shuffleQuestions || false,

      shuffleOptions:
        item.shuffleOptions || false,

      showResultImmediately:
        item.showResultImmediately ?? true,

      examDate:
        item.examDate
          ? item.examDate.split("T")[0]
          : "",

    });


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });


    info(
      "يمكنك الآن تعديل بيانات الامتحان ثم حفظ التغييرات.",
      "تعديل الامتحان"
    );

  };


  // ==================================================
  // PUBLISH EXAM
  // ==================================================

  const publishExam = (id) => {

    confirm({

      title:
        "نشر الامتحان",

      message:
        "هل تريد نشر هذا الامتحان للطلاب؟\nبعد النشر سيظهر للطلاب ويمكنهم بدء الامتحان.",

      confirmText:
        "نعم، نشر الامتحان",

      cancelText:
        "إلغاء",

      onConfirm: async () => {

        try {

          const res = await api.put(
            `/exams/${id}/publish`
          );


          const data = res.data;


          if (!data.success) {

            throw new Error(
              data.message ||
              "تعذر نشر الامتحان"
            );

          }


          success(

            "تم نشر الامتحان وأصبح متاحًا للطلاب.",

            "تم نشر الامتحان"

          );


          await loadExams();


        } catch (err) {

          console.log(err);


          toastError(

            err.response?.data?.message ||
            err.message ||
            "حدث خطأ أثناء نشر الامتحان.",

            "فشل النشر"

          );

        }

      },

    });

  };


  // ==================================================
  // UNPUBLISH EXAM
  // ==================================================

  const unpublishExam = (id) => {

    confirm({

      title:
        "إلغاء نشر الامتحان",

      message:
        "هل تريد إلغاء نشر هذا الامتحان؟\nسيختفي الامتحان من حسابات الطلاب.",

      confirmText:
        "نعم، إلغاء النشر",

      cancelText:
        "إلغاء",

      onConfirm: async () => {

        try {

          const res = await api.put(
            `/exams/${id}/unpublish`
          );


          const data = res.data;


          if (!data.success) {

            throw new Error(
              data.message ||
              "تعذر إلغاء نشر الامتحان"
            );

          }


          success(

            "تم إلغاء نشر الامتحان ولن يظهر للطلاب.",

            "تم إلغاء النشر"

          );


          await loadExams();


        } catch (err) {

          console.log(err);


          toastError(

            err.response?.data?.message ||
            err.message ||
            "حدث خطأ أثناء إلغاء نشر الامتحان.",

            "فشل العملية"

          );

        }

      },

    });

  };


  // ==================================================
  // PUBLISH RESULTS
  // ==================================================

  const publishResults = (id) => {

    confirm({

      title:
        "إعلان نتائج الامتحان",

      message:
        "هل تريد إظهار نتائج هذا الامتحان لجميع الطلاب الذين أدّوه؟\nسيتمكن الطلاب من رؤية درجاتهم ومراجعة إجاباتهم.",

      confirmText:
        "نعم، إعلان النتائج",

      cancelText:
        "إلغاء",

      onConfirm: async () => {

        try {

          const res = await api.put(
            `/exams/${id}/publish-results`
          );


          const data = res.data;


          if (!data.success) {

            throw new Error(
              data.message ||
              "تعذر إعلان النتائج"
            );

          }


          success(

            "تم إعلان النتائج وأصبحت متاحة للطلاب.",

            "تم إعلان النتائج"

          );


          await loadExams();


        } catch (err) {

          console.log(err);


          toastError(

            err.response?.data?.message ||
            err.message ||
            "حدث خطأ أثناء إعلان النتائج.",

            "فشل إعلان النتائج"

          );

        }

      },

    });

  };


  // ==================================================
  // UNPUBLISH RESULTS
  // ==================================================

  const unpublishResults = (id) => {

    confirm({

      title:
        "إخفاء نتائج الامتحان",

      message:
        "هل تريد إخفاء نتائج هذا الامتحان عن الطلاب؟\nلن يتم حذف النتائج، ويمكنك إعلانها مرة أخرى في أي وقت.",

      confirmText:
        "نعم، إخفاء النتائج",

      cancelText:
        "إلغاء",

      onConfirm: async () => {

        try {

          const res = await api.put(
            `/exams/${id}/unpublish-results`
          );


          const data = res.data;


          if (!data.success) {

            throw new Error(
              data.message ||
              "تعذر إخفاء النتائج"
            );

          }


          success(

            "تم إخفاء النتائج عن الطلاب.",

            "تم إخفاء النتائج"

          );


          await loadExams();


        } catch (err) {

          console.log(err);


          toastError(

            err.response?.data?.message ||
            err.message ||
            "حدث خطأ أثناء إخفاء النتائج.",

            "فشل العملية"

          );

        }

      },

    });

  };


  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const cancelEdit = () => {

    setEditId(null);

    setExam(emptyExam);

    info(
      "تم إلغاء تعديل الامتحان.",
      "تم إلغاء التعديل"
    );

  };


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <motion.div

      className="manage-exams"

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


      {/* ==================================================
          BACK
      ================================================== */}

      <button

        className="exam-back-btn"

        onClick={() =>
          navigate("/teacher")
        }

      >

        <FiArrowRight />

        <span>
          الرجوع
        </span>

      </button>


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="exam-page-header">

        <div className="exam-header-icon">

          <FiBookOpen />

        </div>


        <div>

          <h1>
            إدارة الامتحانات
          </h1>


          <p className="page-desc">

            أنشئ ونظم الامتحانات الإلكترونية
            وتابع نتائج الطلاب بسهولة.

          </p>

        </div>

      </div>


      {/* ==================================================
          EXAM FORM
      ================================================== */}

      <form onSubmit={submitExam}>


        <label>
          عنوان الامتحان
        </label>


        <input

          name="title"

          placeholder="مثال : امتحان الوحدة الأولى"

          value={exam.title}

          onChange={handleChange}

        />


        <label>

          <FiLayers />

          الصف الدراسي

        </label>


        <select

          name="classId"

          value={exam.classId}

          onChange={handleChange}

        >

          <option value="">
            اختر الصف
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


        <label>
          وصف الامتحان
        </label>


        <textarea

          name="description"

          value={exam.description}

          onChange={handleChange}

          placeholder="وصف الامتحان"

        />


        <label>

          <FiClock />

          مدة الامتحان بالدقائق

        </label>


        <input

          type="number"

          name="duration"

          value={exam.duration}

          onChange={handleChange}

          placeholder="60"

          min="1"

        />


        <label>
          درجة النجاح
        </label>


        <input

          type="number"

          name="passingMarks"

          value={exam.passingMarks}

          onChange={handleChange}

          min="0"

        />


        <label>
          عدد المحاولات
        </label>


        <input

          type="number"

          name="maxAttempts"

          value={exam.maxAttempts}

          onChange={handleChange}

          min="1"

        />


        {/* ==================================================
            OPTIONS
        ================================================== */}

        <div className="exam-options">


          {/* SHUFFLE QUESTIONS */}

          <div className="switch-box">

            <div>

              <h4>
                🔀 خلط الأسئلة
              </h4>

              <p>
                تغيير ترتيب الأسئلة لكل طالب
              </p>

            </div>


            <label className="switch">

              <input

                type="checkbox"

                name="shuffleQuestions"

                checked={
                  exam.shuffleQuestions
                }

                onChange={handleChange}

              />

              <span className="slider"></span>

            </label>

          </div>


          {/* SHUFFLE OPTIONS */}

          <div className="switch-box">

            <div>

              <h4>
                🔄 خلط الاختيارات
              </h4>

              <p>
                تغيير ترتيب الاختيارات مع الحفاظ على الإجابة الصحيحة
              </p>

            </div>


            <label className="switch">

              <input

                type="checkbox"

                name="shuffleOptions"

                checked={
                  exam.shuffleOptions
                }

                onChange={handleChange}

              />

              <span className="slider"></span>

            </label>

          </div>


        </div>


        {/* ==================================================
            DATE
        ================================================== */}

        <label>

          <FiCalendar />

          موعد الامتحان

        </label>


        <input

          type="date"

          name="examDate"

          value={
            exam.examDate || ""
          }

          onChange={handleChange}

        />


        {/* ==================================================
            SAVE
        ================================================== */}

        <div className="exam-form-actions">

          <button

            type="submit"

            className="save-exam"

            disabled={loading}

          >

            <FiPlus />


            {loading

              ? "جاري الحفظ..."

              : editId

              ? "حفظ التعديل"

              : "إنشاء الامتحان"

            }

          </button>


          {editId && (

            <button

              type="button"

              className="cancel-edit-btn"

              onClick={cancelEdit}

            >

              إلغاء التعديل

            </button>

          )}

        </div>


      </form>


      {/* ==================================================
          FILTER
      ================================================== */}

      <div className="filter-box">

        <label>
          عرض حسب الصف
        </label>


        <select

          value={filterClass}

          onChange={(e) =>
            setFilterClass(
              e.target.value
            )
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


      {/* ==================================================
          EXAMS GRID
      ================================================== */}

      <div className="exam-grid">


        {exams

          .filter(item => {

            if (!filterClass) {

              return true;

            }


            return (
              item.classId?._id ===
              filterClass
            );

          })

          .map(item => (

            <div

              className="exam-card"

              key={item._id}

            >


              {/* GRADE */}

              <span className="grade-badge">

                📝 {item.classId?.name}

              </span>


              {/* EXAM STATUS */}

              <div

                className={`exam-status ${
                  item.status === "published"
                    ? "published"
                    : "draft"
                }`}

              >

                {item.status === "published"

                  ? (
                    <>
                      🟢 منشور للطلاب
                    </>
                  )

                  : (
                    <>
                      ⚪ غير منشور
                    </>
                  )

                }

              </div>


              {/* TITLE */}

              <h3>
                {item.title}
              </h3>


              {/* DESCRIPTION */}

              <p>

                {item.description ||
                  "لا يوجد وصف"}

              </p>


              {/* DURATION */}

              <p>

                ⏱️ {item.duration} دقيقة

              </p>


              {/* QUESTIONS */}

              <button

                type="button"

                className="open-exam"

                onClick={() =>
                  navigate(
                    `/teacher/exams/${item._id}/questions`
                  )
                }

              >

                📚 إدارة الأسئلة

              </button>


              {/* ACTIONS */}

              <div className="exam-actions">


                {/* EDIT */}

                <button

                  type="button"

                  onClick={() =>
                    editExam(item)
                  }

                >

                  ✏️ تعديل

                </button>


                {/* DELETE */}

                <button

                  type="button"

                  onClick={() =>
                    deleteExam(
                      item._id
                    )
                  }

                >

                  🗑 حذف

                </button>


                {/* PUBLISH / UNPUBLISH */}

                {item.status === "published"

                  ? (

                    <button

                      type="button"

                      className="unpublish-btn"

                      onClick={() =>
                        unpublishExam(
                          item._id
                        )
                      }

                    >

                      🔒 إلغاء النشر

                    </button>

                  )

                  : (

                    <button

                      type="button"

                      className="publish-btn"

                      onClick={() =>
                        publishExam(
                          item._id
                        )
                      }

                    >

                      🚀 نشر الامتحان

                    </button>

                  )

                }


                {/* RESULTS */}

                <button

                  type="button"

                  className="results-btn"

                  onClick={() =>
                    navigate(
                      `/teacher/exam-results/${item._id}`
                    )
                  }

                >

                  📊 نتائج الطلاب

                </button>


                {/* ==================================================
                    RESULTS CONTROL
                ================================================== */}

                <div className="results-control">


                  {item.resultsPublished

                    ? (

                      <>

                        <div className="results-status published">

                          🟢 النتائج معلنة للطلاب

                        </div>


                        <button

                          type="button"

                          className="hide-results-btn"

                          onClick={() =>
                            unpublishResults(
                              item._id
                            )
                          }

                        >

                          🔒 إخفاء النتائج

                        </button>

                      </>

                    )

                    : (

                      <>

                        <div className="results-status hidden">

                          🔒 النتائج مخفية عن الطلاب

                        </div>


                        <button

                          type="button"

                          className="show-results-btn"

                          onClick={() =>
                            publishResults(
                              item._id
                            )
                          }

                        >

                          👁️ إظهار النتائج للطلاب

                        </button>

                      </>

                    )

                  }

                </div>


              </div>


            </div>

          ))

        }


      </div>


      {/* ==================================================
          TOAST
      ================================================== */}

      {toast && (

        <div className="toast-container">

          <Toast

            type={toast.type}

            title={toast.title}

            message={toast.message}

            confirm={toast.confirm}

            confirmText={
              toast.confirmText
            }

            cancelText={
              toast.cancelText
            }

            showCancel={
              toast.showCancel
            }

            onConfirm={
              toast.onConfirm
            }

            onCancel={
              toast.onCancel
            }

            onClose={
              closeToast
            }

          />

        </div>

      )}


    </motion.div>

  );

}
