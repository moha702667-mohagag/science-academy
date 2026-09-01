import { useEffect, useState } from "react";

import {
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaSchool,
  FaCheck,
  FaTimes,
  FaSyncAlt,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import "./TeacherPendingStudents.css";

export default function TeacherPendingStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // =========================================
  // Load Pending Students
  // =========================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("يجب تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }

      const response = await api.get(
        "/teacher/pending-students"
      );

      const data = response.data;

      console.log("PENDING STUDENTS:", data);

      if (data.success) {
        setStudents(data.students || []);
      } else {
        throw new Error(
          data.message || "فشل تحميل طلبات التسجيل"
        );
      }
    } catch (err) {
      console.error(
        "LOAD PENDING STUDENTS ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "حدث خطأ أثناء تحميل الطلبات";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Load On Page Open
  // =========================================

  useEffect(() => {
    loadStudents();
  }, []);

  // =========================================
  // Approve Student
  // =========================================

  const approveStudent = async (studentId) => {
    try {
      setActionLoading(studentId);

      const response = await api.put(
        `/teacher/students/${studentId}/approve`
      );

      const data = response.data;

      console.log("APPROVE RESPONSE:", data);

      if (!data.success) {
        throw new Error(
          data.message || "فشل قبول الطالب"
        );
      }

      setStudents((prev) =>
        prev.filter(
          (student) => student._id !== studentId
        )
      );
    } catch (err) {
      console.error(
        "APPROVE STUDENT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء قبول الطالب"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================
  // Reject Student
  // =========================================

  const rejectStudent = async (studentId) => {
    const confirmReject = window.confirm(
      "هل أنت متأكد من رفض طلب تسجيل هذا الطالب؟"
    );

    if (!confirmReject) {
      return;
    }

    try {
      setActionLoading(studentId);

      const response = await api.put(
        `/teacher/students/${studentId}/reject`
      );

      const data = response.data;

      console.log("REJECT RESPONSE:", data);

      if (!data.success) {
        throw new Error(
          data.message || "فشل رفض الطالب"
        );
      }

      setStudents((prev) =>
        prev.filter(
          (student) => student._id !== studentId
        )
      );
    } catch (err) {
      console.error(
        "REJECT STUDENT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء رفض الطالب"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <section className="pending-students-page">
        <div className="pending-loading">
          <div className="pending-spinner"></div>

          <h3>
            جاري تحميل طلبات التسجيل...
          </h3>

          <p>
            لحظات ونجيب لك الطلاب المنتظرين
          </p>
        </div>
      </section>
    );
  }

  // =========================================
  // Page
  // =========================================

  return (
    <section className="pending-students-page">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <div className="pending-top-bar">

        <button
          className="pending-back-btn"
          onClick={() => navigate("/teacher")}
        >
          <FaArrowRight />

          <span>
            لوحة التحكم
          </span>
        </button>

        <button
          className="pending-refresh-btn"
          onClick={loadStudents}
          disabled={loading}
        >
          <FaSyncAlt />

          <span>
            تحديث
          </span>
        </button>

      </div>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="pending-header">

        <div className="pending-header-icon">
          <FaUserGraduate />
        </div>

        <div>

          <h1>
            طلبات تسجيل الطلاب
          </h1>

          <p>
            راجع طلبات الطلاب الجدد وقم بقبول أو رفض الحسابات
          </p>

        </div>

      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="pending-error">
          {error}
        </div>
      )}

      {/* =====================================
          COUNTER
      ===================================== */}

      <div className="pending-counter">

        <span>
          الطلبات المعلقة
        </span>

        <strong>
          {students.length}
        </strong>

      </div>

      {/* =====================================
          EMPTY
      ===================================== */}

      {students.length === 0 && !error && (
        <div className="pending-empty">

          <div className="pending-empty-icon">
            <FaUserGraduate />
          </div>

          <h2>
            لا توجد طلبات تسجيل حاليًا
          </h2>

          <p>
            عندما يقوم طالب بإنشاء حساب جديد
            سيظهر طلبه هنا للمراجعة.
          </p>

        </div>
      )}

      {/* =====================================
          STUDENTS
      ===================================== */}

      {students.length > 0 && (
        <div className="pending-students-grid">

          {students.map((student) => {

            const isProcessing =
              actionLoading === student._id;

            return (
              <div
                className="pending-student-card"
                key={student._id}
              >

                {/* Card Top */}

                <div className="student-card-top">

                  <div className="student-avatar">

                    {student.fullName
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>

                  <div className="student-name-area">

                    <h2>
                      {student.fullName}
                    </h2>

                    <span>
                      حساب في انتظار الموافقة
                    </span>

                  </div>

                </div>

                {/* Student Information */}

                <div className="student-info-list">

                  <div className="student-info-item">

                    <div className="student-info-icon">
                      <FaEnvelope />
                    </div>

                    <div>

                      <small>
                        البريد الإلكتروني
                      </small>

                      <strong>
                        {student.email ||
                          "غير متوفر"}
                      </strong>

                    </div>

                  </div>

                  <div className="student-info-item">

                    <div className="student-info-icon">
                      <FaPhone />
                    </div>

                    <div>

                      <small>
                        رقم الطالب
                      </small>

                      <strong>
                        {student.phone ||
                          "غير متوفر"}
                      </strong>

                    </div>

                  </div>

                  <div className="student-info-item">

                    <div className="student-info-icon">
                      <FaUserGraduate />
                    </div>

                    <div>

                      <small>
                        الصف الدراسي
                      </small>

                      <strong>
                        {student.grade ||
                          "غير محدد"}
                      </strong>

                    </div>

                  </div>

                  <div className="student-info-item">

                    <div className="student-info-icon">
                      <FaSchool />
                    </div>

                    <div>

                      <small>
                        المدرسة
                      </small>

                      <strong>
                        {student.school ||
                          "غير متوفر"}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* Parent Phone */}

                {student.parentPhone && (
                  <div className="student-parent-phone">

                    <FaPhone />

                    <span>
                      رقم ولي الأمر:
                    </span>

                    <strong>
                      {student.parentPhone}
                    </strong>

                  </div>
                )}

                {/* Actions */}

                <div className="student-actions">

                  <button
                    className="approve-student-btn"
                    onClick={() =>
                      approveStudent(
                        student._id
                      )
                    }
                    disabled={isProcessing}
                  >

                    <FaCheck />

                    {isProcessing
                      ? "جاري التنفيذ..."
                      : "قبول الطالب"}

                  </button>

                  <button
                    className="reject-student-btn"
                    onClick={() =>
                      rejectStudent(
                        student._id
                      )
                    }
                    disabled={isProcessing}
                  >

                    <FaTimes />

                    رفض الطلب

                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}
