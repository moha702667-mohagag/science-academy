import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import useToast from "../hooks/useToast";
import Toast from "../components/Toast/Toast";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaSchool,
  FaChalkboardTeacher,
  FaBookOpen,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
} from "react-icons/fa";

import "./AuthPage.css";

function AuthPage() {
  const navigate = useNavigate();

  // ==================================================
  // TOAST
  // ==================================================

  const {
    toast,
    success: showSuccess,
    error: showToastError,
    warning: showWarning,
    info: showInfo,
    confirm,
    closeToast,
  } = useToast();

  // ==================================================
  // AUTH MODE
  // ==================================================

  const [mode, setMode] = useState("login");
  // login | register

  // ==================================================
  // ROLE
  // ==================================================

  const [role, setRole] = useState("student");
  // student | teacher

  // ==================================================
  // PASSWORD VISIBILITY
  // ==================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ==================================================
  // LOGIN DATA
  // ==================================================

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // ==================================================
  // REGISTER DATA
  // ==================================================

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    governorate: "",
    age: "",

    password: "",
    confirmPassword: "",

    // TEACHER
    registrationCode: "",
    subject: "",
    experience: "",
    qualification: "",
    bio: "",

    // STUDENT
    parentPhone: "",
    grade: "",
    school: "",
  });

  // ==================================================
  // LOGIN CHANGE
  // ==================================================

  const handleLoginChange = (e) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==================================================
  // REGISTER CHANGE
  // ==================================================

  const handleRegisterChange = (e) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==================================================
  // RESET REGISTER FORM
  // ==================================================

  const resetRegisterForm = () => {
    setRegisterData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      governorate: "",
      age: "",

      password: "",
      confirmPassword: "",

      registrationCode: "",
      subject: "",
      experience: "",
      qualification: "",
      bio: "",

      parentPhone: "",
      grade: "",
      school: "",
    });

    setShowPassword(false);
    setShowConfirm(false);
  };

  // ==================================================
  // LOGIN VALIDATION
  // ==================================================

  const validateLogin = () => {
    if (!loginData.email.trim()) {
      showInfo("من فضلك أدخل البريد الإلكتروني");
      return false;
    }

    if (!loginData.password) {
      showInfo("من فضلك أدخل كلمة المرور");
      return false;
    }

    return true;
  };

  // ==================================================
  // REGISTER VALIDATION
  // ==================================================

  const validateRegister = () => {
    // ==================================================
    // BASIC DATA
    // ==================================================

    if (!registerData.fullName.trim()) {
      showInfo("من فضلك أدخل الاسم بالكامل");
      return false;
    }

    if (!registerData.email.trim()) {
      showInfo("من فضلك أدخل البريد الإلكتروني");
      return false;
    }

    if (!registerData.phone.trim()) {
      showInfo("من فضلك أدخل رقم الهاتف");
      return false;
    }

    if (!registerData.address.trim()) {
      showInfo("من فضلك أدخل العنوان");
      return false;
    }

    if (!registerData.governorate.trim()) {
      showInfo("من فضلك أدخل المحافظة");
      return false;
    }

    if (!registerData.age) {
      showInfo("من فضلك أدخل السن");
      return false;
    }

    if (!registerData.password) {
      showInfo("من فضلك أدخل كلمة المرور");
      return false;
    }

    if (!registerData.confirmPassword) {
      showInfo("من فضلك أعد إدخال كلمة المرور");
      return false;
    }

    // ==================================================
    // PASSWORD
    // ==================================================

    if (registerData.password !== registerData.confirmPassword) {
      showWarning(
        "كلمة المرور وتأكيد كلمة المرور غير متطابقين"
      );

      return false;
    }

    // ==================================================
    // STUDENT
    // ==================================================

    if (role === "student") {
      if (!registerData.parentPhone.trim()) {
        showInfo("من فضلك أدخل رقم ولي الأمر");
        return false;
      }

      if (!registerData.grade) {
        showInfo("من فضلك اختر الصف الدراسي");
        return false;
      }

      if (!registerData.school.trim()) {
        showInfo("من فضلك أدخل اسم المدرسة");
        return false;
      }
    }

    // ==================================================
    // TEACHER
    // ==================================================

    if (role === "teacher") {
      if (!registerData.registrationCode.trim()) {
        showInfo("من فضلك أدخل كود المدرس");
        return false;
      }

      if (!registerData.subject.trim()) {
        showInfo("من فضلك أدخل المادة");
        return false;
      }

      if (!registerData.experience.trim()) {
        showInfo("من فضلك أدخل سنوات الخبرة");
        return false;
      }

      if (!registerData.qualification.trim()) {
        showInfo("من فضلك أدخل المؤهل");
        return false;
      }

      if (!registerData.bio.trim()) {
        showInfo("من فضلك اكتب نبذة قصيرة عنك");
        return false;
      }
    }

    return true;
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // مهم:
    // نمنع required من إظهار رسالة المتصفح
    // ونستخدم Toast فقط.

    if (!validateLogin()) {
      return;
    }

    try {
      const res = await api.post(
        "/auth/login",
        {
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }
      );

      const data = res.data;

      // ==================================================
      // SUCCESS
      // ==================================================

      if (data.success) {
        const { token, user } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        showSuccess("تم تسجيل الدخول بنجاح ✅");

        // ==================================================
        // REDIRECT AFTER LOGIN
        // ==================================================

        const redirectPath =
          localStorage.getItem("redirectAfterLogin");

        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");

          navigate(redirectPath);

          return;
        }

        // ==================================================
        // TEACHER
        // ==================================================

        if (user.role === "teacher") {
          navigate("/teacher");
          return;
        }

        // ==================================================
        // STUDENT
        // ==================================================

        if (user.role === "student") {
          navigate(`/class/${user.grade}`);
          return;
        }

        return;
      }

      showToastError(
        data.message || "حدث خطأ أثناء تسجيل الدخول"
      );
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      // ==================================================
      // EMAIL NOT VERIFIED
      // ==================================================

      if (error.response?.data?.emailNotVerified) {
        const verificationEmail =
          loginData.email.trim().toLowerCase();

        localStorage.setItem(
          "verificationEmail",
          verificationEmail
        );

        confirm({
          title: "البريد الإلكتروني غير مؤكد",
          message:
            "البريد الإلكتروني الخاص بك غير مؤكد.\n\nهل تريد الانتقال إلى صفحة تأكيد البريد الإلكتروني؟",

          confirmText: "تأكيد البريد الإلكتروني",
          cancelText: "إلغاء",

          onConfirm: () => {
            localStorage.setItem(
              "verificationEmail",
              verificationEmail
            );

            navigate("/verify-email");
          },
        });

        return;
      }

      // ==================================================
      // STUDENT PENDING
      // ==================================================

      if (error.response?.data?.pending) {
        confirm({
          title: "الحساب في انتظار الموافقة ⏳",

          message:
            "حسابك في انتظار موافقة المدرس.\n\nيمكنك الدخول إلى الموقع بعد موافقة المدرس على حسابك.",

          confirmText: "حسنًا",
          cancelText: "إغلاق",
        });

        return;
      }

      // ==================================================
      // STUDENT REJECTED
      // ==================================================

      if (error.response?.data?.rejected) {
        showToastError(
          "تم رفض طلب إنشاء الحساب ❌\n\nيرجى التواصل مع المدرس."
        );

        return;
      }

      // ==================================================
      // GENERAL ERROR
      // ==================================================

      showToastError(
        error.response?.data?.message ||
          "حدث خطأ أثناء تسجيل الدخول"
      );
    }
  };

  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!validateRegister()) {
      return;
    }

    try {
      // ==================================================
      // BASE PAYLOAD
      // ==================================================

      const payload = {
        fullName: registerData.fullName.trim(),

        email: registerData.email
          .trim()
          .toLowerCase(),

        phone: registerData.phone.trim(),

        address: registerData.address.trim(),

        governorate: registerData.governorate.trim(),

        age: registerData.age,

        password: registerData.password,

        role,
      };

      // ==================================================
      // STUDENT DATA
      // ==================================================

      if (role === "student") {
        payload.parentPhone =
          registerData.parentPhone.trim();

        payload.grade = registerData.grade;

        payload.school =
          registerData.school.trim();
      }

      // ==================================================
      // TEACHER DATA
      // ==================================================

      if (role === "teacher") {
        payload.registrationCode =
          registerData.registrationCode
            .trim()
            .toUpperCase();

        payload.subject =
          registerData.subject.trim();

        payload.experience =
          registerData.experience.trim();

        payload.qualification =
          registerData.qualification.trim();

        payload.bio =
          registerData.bio.trim();
      }

      // ==================================================
      // SEND REGISTER REQUEST
      // ==================================================

      const res = await api.post(
        "/auth/register",
        payload
      );

      const data = res.data;

      // ==================================================
      // BACKEND ERROR
      // ==================================================

      if (!data.success) {
        showToastError(
          data.message ||
            "حدث خطأ أثناء إنشاء الحساب"
        );

        return;
      }

      // ==================================================
      // VERIFICATION EMAIL
      // ==================================================

      const verificationEmail =
        registerData.email.trim().toLowerCase();

      localStorage.setItem(
        "verificationEmail",
        verificationEmail
      );

      // ==================================================
      // REMOVE OLD AUTH DATA
      // ==================================================

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ==================================================
      // SUCCESS
      // ==================================================

      showSuccess(
        "تم إنشاء الحساب بنجاح ✅\n\nتم إرسال كود التحقق إلى بريدك الإلكتروني."
      );

      // ==================================================
      // RESET
      // ==================================================

      resetRegisterForm();

      // ==================================================
      // GO TO VERIFY EMAIL
      // ==================================================

      navigate("/verify-email", {
        state: {
          email: verificationEmail,
          role,
        },
      });
    } catch (error) {
      console.log("REGISTER ERROR:", error);

      // ==================================================
      // EMAIL ALREADY EXISTS BUT NOT VERIFIED
      // ==================================================

      if (error.response?.data?.emailNotVerified) {
        const verificationEmail =
          registerData.email.trim().toLowerCase();

        localStorage.setItem(
          "verificationEmail",
          verificationEmail
        );

        confirm({
          title: "البريد الإلكتروني غير مؤكد",

          message:
            "هذا البريد الإلكتروني مسجل بالفعل لكنه غير مؤكد.\n\nهل تريد الانتقال إلى صفحة تأكيد البريد الإلكتروني؟",

          confirmText: "تأكيد البريد الإلكتروني",
          cancelText: "إلغاء",

          onConfirm: () => {
            navigate("/verify-email", {
              state: {
                email: verificationEmail,
              },
            });
          },
        });

        return;
      }

      // ==================================================
      // GENERAL ERROR
      // ==================================================

      showToastError(
        error.response?.data?.message ||
          "حدث خطأ أثناء إنشاء الحساب"
      );
    }
  };

  // ==================================================
  // CHANGE ROLE
  // ==================================================

  const handleRoleChange = (newRole) => {
    setRole(newRole);

    if (newRole === "student") {
      setRegisterData((prev) => ({
        ...prev,

        registrationCode: "",
        subject: "",
        experience: "",
        qualification: "",
        bio: "",
      }));
    }

    if (newRole === "teacher") {
      setRegisterData((prev) => ({
        ...prev,

        parentPhone: "",
        grade: "",
        school: "",
      }));
    }
  };

  // ==================================================
  // JSX
  // ==================================================

  return (
    <section className="auth-page">

      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="auth-bg-shape shape-1"></div>
      <div className="auth-bg-shape shape-2"></div>
      <div className="auth-bg-shape shape-3"></div>

      {/* =========================================
          MAIN CONTAINER
      ========================================= */}

      <div className="auth-container">

        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <div className="auth-left">

          <div className="auth-brand">

            <span className="auth-badge">
              Science Academy
            </span>

            <span className="auth-badge">
              مستر احمد حجاج
            </span>

            <h1>
              منصة تعليمية حديثة
              <br />
              للطلاب والمدرسين
            </h1>

            <p>
              سجّل الآن وابدأ رحلتك التعليمية
              بشكل منظم واحترافي.
            </p>

          </div>

          {/* FEATURES */}

          <div className="auth-features">

            {/* STUDENT */}

            <div className="feature-card">

              <FaUserGraduate
                className="feature-icon"
              />

              <div>

                <h3>
                  للطلاب
                </h3>

                <p>
                  متابعة الكورسات والواجبات
                  والامتحانات من مكان واحد.
                </p>

              </div>

            </div>

            {/* TEACHER */}

            <div className="feature-card">

              <FaChalkboardTeacher
                className="feature-icon"
              />

              <div>

                <h3>
                  للمدرسين
                </h3>

                <p>
                  إدارة المحتوى التعليمي
                  والطلاب والاختبارات بسهولة.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =========================================
            RIGHT SIDE
        ========================================= */}

        <div className="auth-card">

          {/* TABS */}

          <div className="auth-tabs">

            <button
              type="button"
              className={
                mode === "login"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() => setMode("login")}
            >
              تسجيل الدخول
            </button>

            <button
              type="button"
              className={
                mode === "register"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() => setMode("register")}
            >
              إنشاء حساب
            </button>

          </div>

          {/* =========================================
              LOGIN
          ========================================= */}

          {mode === "login" ? (

            <form
              className="auth-form"
              onSubmit={handleLoginSubmit}
            >

              <div className="form-header">

                <h2>
                  مرحبًا بعودتك 👋
                </h2>

                <p>
                  سجّل دخولك للوصول إلى حسابك.
                </p>

              </div>

              {/* EMAIL */}

              <div className="input-group">

                <label>
                  البريد الإلكتروني
                </label>

                <div className="input-box">

                  <FaEnvelope
                    className="input-icon"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="ادخل البريد الإلكتروني"
                    value={loginData.email}
                    onChange={handleLoginChange}
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="input-group">

                <label>
                  كلمة المرور
                </label>

                <div className="input-box">

                  <FaLock
                    className="input-icon"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="ادخل كلمة المرور"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit-btn"
              >
                تسجيل الدخول
              </button>

            </form>

          ) : (

            /* =========================================
               REGISTER
            ========================================= */

            <form
              className="auth-form register-form"
              onSubmit={handleRegisterSubmit}
            >

              <div className="form-header">

                <h2>
                  إنشاء حساب جديد
                </h2>

                <p>
                  املأ البيانات التالية لإنشاء حسابك.
                </p>

              </div>

              {/* ROLE SWITCH */}

              <div className="role-switch">

                <button
                  type="button"
                  className={
                    role === "student"
                      ? "role-btn active"
                      : "role-btn"
                  }
                  onClick={() =>
                    handleRoleChange("student")
                  }
                >
                  طالب
                </button>

                <button
                  type="button"
                  className={
                    role === "teacher"
                      ? "role-btn active"
                      : "role-btn"
                  }
                  onClick={() =>
                    handleRoleChange("teacher")
                  }
                >
                  مدرس
                </button>

              </div>

              {/* TEACHER CODE */}

              {role === "teacher" && (

                <div className="input-group access-code-group">

                  <label>
                    كود المدرس
                  </label>

                  <div className="input-box">

                    <FaLock
                      className="input-icon"
                    />

                    <input
                      type="password"
                      name="registrationCode"
                      placeholder="أدخل كود المدرس"
                      value={
                        registerData.registrationCode
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

              )}

              {/* BASIC DATA */}

              <div className="form-grid">

                {/* FULL NAME */}

                <div className="input-group">

                  <label>
                    الاسم بالكامل
                  </label>

                  <div className="input-box">

                    <FaUser
                      className="input-icon"
                    />

                    <input
                      type="text"
                      name="fullName"
                      placeholder="ادخل الاسم بالكامل"
                      value={
                        registerData.fullName
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="input-group">

                  <label>
                    البريد الإلكتروني
                  </label>

                  <div className="input-box">

                    <FaEnvelope
                      className="input-icon"
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="ادخل البريد الإلكتروني"
                      value={
                        registerData.email
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div className="input-group">

                  <label>
                    رقم الهاتف
                  </label>

                  <div className="input-box">

                    <FaPhone
                      className="input-icon"
                    />

                    <input
                      type="text"
                      name="phone"
                      placeholder="ادخل رقم الهاتف"
                      value={
                        registerData.phone
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

                {/* ADDRESS */}

                <div className="input-group">

                  <label>
                    العنوان
                  </label>

                  <div className="input-box">

                    <FaMapMarkerAlt
                      className="input-icon"
                    />

                    <input
                      type="text"
                      name="address"
                      placeholder="ادخل العنوان"
                      value={
                        registerData.address
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

                {/* GOVERNORATE */}

                <div className="input-group">

                  <label>
                    المحافظة
                  </label>

                  <div className="input-box">

                    <FaMapMarkerAlt
                      className="input-icon"
                    />

                    <input
                      type="text"
                      name="governorate"
                      placeholder="ادخل المحافظة"
                      value={
                        registerData.governorate
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

                {/* AGE */}

                <div className="input-group">

                  <label>
                    السن
                  </label>

                  <div className="input-box">

                    <FaUser
                      className="input-icon"
                    />

                    <input
                      type="number"
                      name="age"
                      min="5"
                      max="100"
                      placeholder="ادخل السن"
                      value={
                        registerData.age
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="input-group">

                  <label>
                    كلمة المرور
                  </label>

                  <div className="input-box">

                    <FaLock
                      className="input-icon"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="ادخل كلمة المرور"
                      value={
                        registerData.password
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="input-group">

                  <label>
                    تأكيد كلمة المرور
                  </label>

                  <div className="input-box">

                    <FaLock
                      className="input-icon"
                    />

                    <input
                      type={
                        showConfirm
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      placeholder="أعد إدخال كلمة المرور"
                      value={
                        registerData.confirmPassword
                      }
                      onChange={
                        handleRegisterChange
                      }
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirm(
                          !showConfirm
                        )
                      }
                    >
                      {showConfirm ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* =========================================
                  STUDENT DATA
              ========================================= */}

              {role === "student" && (

                <div className="extra-section">

                  <h3>
                    بيانات الطالب
                  </h3>

                  <div className="form-grid">

                    {/* PARENT PHONE */}

                    <div className="input-group">

                      <label>
                        رقم ولي الأمر
                      </label>

                      <div className="input-box">

                        <FaPhone
                          className="input-icon"
                        />

                        <input
                          type="text"
                          name="parentPhone"
                          placeholder="ادخل رقم ولي الأمر"
                          value={
                            registerData.parentPhone
                          }
                          onChange={
                            handleRegisterChange
                          }
                        />

                      </div>

                    </div>

                    {/* GRADE */}

                    <div className="input-group">

                      <label>
                        الصف الدراسي
                      </label>

                      <div className="input-box">

                        <FaBookOpen
                          className="input-icon"
                        />

                        <select
                          name="grade"
                          value={
                            registerData.grade
                          }
                          onChange={
                            handleRegisterChange
                          }
                        >

                          <option value="">
                            اختر الصف الدراسي
                          </option>

                          <option value="الرابع الابتدائي">
                            الرابع الابتدائي
                          </option>

                          <option value="الخامس الابتدائي">
                            الخامس الابتدائي
                          </option>

                          <option value="السادس الابتدائي">
                            السادس الابتدائي
                          </option>

                          <option value="الأول الإعدادي">
                            الأول الإعدادي
                          </option>

                          <option value="الثاني الإعدادي">
                            الثاني الإعدادي
                          </option>

                          <option value="الثالث الإعدادي">
                            الثالث الإعدادي
                          </option>

                          <option value="الأول الثانوي">
                            الأول الثانوي
                          </option>

                        </select>

                      </div>

                    </div>

                    {/* SCHOOL */}

                    <div className="input-group full-width">

                      <label>
                        المدرسة
                      </label>

                      <div className="input-box">

                        <FaSchool
                          className="input-icon"
                        />

                        <input
                          type="text"
                          name="school"
                          placeholder="ادخل اسم المدرسة"
                          value={
                            registerData.school
                          }
                          onChange={
                            handleRegisterChange
                          }
                        />

                      </div>

                    </div>

                  </div>

                  {/* PENDING INFO */}

                  <div className="pending-info">

                    <span>
                      ⏳
                    </span>

                    <p>
                      بعد تأكيد البريد الإلكتروني،
                      سيحتاج المدرس إلى الموافقة
                      على حسابك قبل أن تتمكن من
                      الدخول إلى المنصة.
                    </p>

                  </div>

                </div>

              )}

              {/* =========================================
                  TEACHER DATA
              ========================================= */}

              {role === "teacher" && (

                <div className="extra-section">

                  <h3>
                    بيانات المدرس
                  </h3>

                  <div className="form-grid">

                    {/* SUBJECT */}

                    <div className="input-group">

                      <label>
                        المادة
                      </label>

                      <div className="input-box">

                        <FaBookOpen
                          className="input-icon"
                        />

                        <input
                          type="text"
                          name="subject"
                          placeholder="مثال: علوم"
                          value={
                            registerData.subject
                          }
                          onChange={
                            handleRegisterChange
                          }
                        />

                      </div>

                    </div>

                    {/* EXPERIENCE */}

                    <div className="input-group">

                      <label>
                        سنوات الخبرة
                      </label>

                      <div className="input-box">

                        <FaChalkboardTeacher
                          className="input-icon"
                        />

                        <input
                          type="text"
                          name="experience"
                          placeholder="مثال: 5 سنوات"
                          value={
                            registerData.experience
                          }
                          onChange={
                            handleRegisterChange
                          }
                        />

                      </div>

                    </div>

                    {/* QUALIFICATION */}

                    <div className="input-group">

                      <label>
                        المؤهل
                      </label>

                      <div className="input-box">

                        <FaUser
                          className="input-icon"
                        />

                        <input
                          type="text"
                          name="qualification"
                          placeholder="ادخل المؤهل"
                          value={
                            registerData.qualification
                          }
                          onChange={
                            handleRegisterChange
                          }
                        />

                      </div>

                    </div>

                    {/* BIO */}

                    <div className="input-group full-width">

                      <label>
                        نبذة قصيرة
                      </label>

                      <div className="input-box textarea-box">

                        <textarea
                          name="bio"
                          rows="4"
                          placeholder="اكتب نبذة مختصرة عنك"
                          value={
                            registerData.bio
                          }
                          onChange={
                            handleRegisterChange
                          }
                        ></textarea>

                      </div>

                    </div>

                  </div>

                </div>

              )}

              {/* =========================================
                  SUBMIT
              ========================================= */}

              <button
                type="submit"
                className="auth-submit-btn"
              >
                {role === "student"
                  ? "إرسال طلب إنشاء الحساب"
                  : "إنشاء حساب المدرس"}
              </button>

            </form>
          )}

        </div>
      </div>

      {/* =========================================
          TOAST
      ========================================= */}

      {toast && (
        <div className="toast-container">

          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            confirm={toast.confirm}
            confirmText={toast.confirmText}
            cancelText={toast.cancelText}
            onConfirm={toast.onConfirm}
            onCancel={toast.onCancel}
            onClose={closeToast}
          />

        </div>
      )}

    </section>
  );
}

export default AuthPage;
