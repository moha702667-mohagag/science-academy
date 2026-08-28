import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast/Toast";

import {
  FaEnvelope,
  FaShieldAlt,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa";

import "./EmailVerification.css";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==================================================
  // EMAIL
  // ==================================================

  const email =
    location.state?.email ||
    localStorage.getItem("verificationEmail") ||
    "";

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(10);

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
  // VERIFY
  // ==================================================

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      showToastError(
        "لم يتم العثور على البريد الإلكتروني. يرجى التسجيل مرة أخرى."
      );

      return;
    }

    if (code.length !== 6) {
      showToastError("من فضلك أدخل كود التحقق المكون من 6 أرقام.");

      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/verify-email",
        {
          email,
          code,
        }
      );

      const data = res.data;

      // ==================================================
// TEACHER
// ==================================================

if (
  data.success &&
  data.token &&
  data.user &&
  data.user.role === "teacher"
) {

  localStorage.setItem(
    "token",
    data.token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );

  localStorage.removeItem(
    "verificationEmail"
  );

  showSuccess(
    "تم تأكيد البريد الإلكتروني وإنشاء الحساب بنجاح ✅"
  );

  navigate("/teacher");

  return;
}


// ==================================================
// STUDENT
// ==================================================

if (
  data.success &&
  data.pending
) {

  localStorage.removeItem("token");

  localStorage.removeItem("user");

  localStorage.removeItem(
    "verificationEmail"
  );

  showSuccess(
    "تم تأكيد البريد الإلكتروني بنجاح ✅"
  );

  setRedirecting(true);
  setCountdown(10);

  let seconds = 10;

  const countdownInterval =
    setInterval(() => {

      seconds -= 1;

      setCountdown(seconds);

      if (seconds <= 0) {
        clearInterval(countdownInterval);
      }

    }, 1000);

  setTimeout(() => {

    clearInterval(countdownInterval);

    navigate("/auth");

  }, 10000);

  return;
}
      // ==================================================
      // FALLBACK
      // ==================================================

      if (data.success) {
        showSuccess(
          data.message ||
            "تم تأكيد البريد الإلكتروني بنجاح."
        );

        return;
      }

    } catch (error) {
      console.log(
        "EMAIL VERIFICATION ERROR:",
        error
      );

      showToastError(
        error.response?.data?.message ||
          "حدث خطأ أثناء تأكيد البريد الإلكتروني."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // RESEND CODE
  // ==================================================

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email) {
      showToastError(
        "لم يتم العثور على البريد الإلكتروني."
      );

      return;
    }

    try {
      setResending(true);

      const res = await api.post(
        "/auth/resend-verification",
        {
          email,
        }
      );

      if (res.data.success) {
        showSuccess(
          "تم إرسال كود تحقق جديد إلى بريدك الإلكتروني ✅"
        );

        setCode("");
      }

    } catch (error) {
      console.log(
        "RESEND VERIFICATION ERROR:",
        error
      );

      showToastError(
        error.response?.data?.message ||
          "حدث خطأ أثناء إعادة إرسال الكود."
      );
    } finally {
      setResending(false);
    }
  };

  // ==================================================
  // CHANGE EMAIL
  // ==================================================

  const handleBack = () => {

  if (!email) {
    navigate("/auth", {
      state: {
        mode: "register",
      },
    });

    return;
  }

  confirm({
    title: "تغيير البريد الإلكتروني؟",

    message:
      "سيتم حذف الحساب الحالي غير المؤكد وجميع بياناته من قاعدة البيانات.\n\nبعد ذلك يمكنك إنشاء حساب جديد باستخدام بريد إلكتروني آخر.",

    confirmText: "نعم، احذف الحساب",

    cancelText: "إلغاء",

    onConfirm: async () => {

      try {

        setLoading(true);

        const res = await api.delete(
          "/auth/delete-unverified-account",
          {
            data: {
              email,
            },
          }
        );

        if (!res.data.success) {

          showToastError(
            res.data.message ||
              "تعذر حذف الحساب."
          );

          return;
        }

        // =========================================
        // CLEAR LOCAL STORAGE
        // =========================================

        localStorage.removeItem(
          "verificationEmail"
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "redirectAfterLogin"
        );

        // =========================================
        // GO REGISTER
        // =========================================

        navigate("/auth", {
          state: {
            mode: "register",
          },
        });

      } catch (error) {

        console.log(
          "DELETE ACCOUNT ERROR:",
          error
        );

        showToastError(
          error.response?.data?.message ||
            "حدث خطأ أثناء حذف الحساب."
        );

      } finally {

        setLoading(false);

      }

    },

    onCancel: () => {

      console.log(
        "User cancelled account deletion"
      );

    },
  });
};
  // ==================================================
  // JSX
  // ==================================================

  return (
    <section className="verification-page">

      {/* Background */}

      <div className="verification-bg-shape shape-1"></div>

      <div className="verification-bg-shape shape-2"></div>

      <div className="verification-bg-shape shape-3"></div>

      {/* Card */}

      <div className="verification-card">

        {/* Icon */}

        <div className="verification-icon">
          <FaShieldAlt />
        </div>

        {/* Header */}

        <div className="verification-header">

          <span className="verification-badge">
            Science Academy
          </span>

          <h1>
            تأكيد البريد الإلكتروني
          </h1>

          <p>
            تم إرسال كود التحقق إلى بريدك الإلكتروني
          </p>

        </div>

        {/* Email */}

        <div className="verification-email">

          <FaEnvelope />

          <span>
            {email || "البريد الإلكتروني"}
          </span>

        </div>

        {/* Form */}

        <form
          onSubmit={handleVerify}
          className="verification-form"
        >

          <label>
            أدخل كود التحقق
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const value =
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

              setCode(value);
              setError("");
            }}
            autoComplete="one-time-code"
          />

          <p className="verification-hint">
            أدخل الكود المكون من 6 أرقام الذي وصلك
            على البريد الإلكتروني.
          </p>

          {/* Error */}

          {error && (
            <div className="verification-error">
              {error}
            </div>
          )}

          {/* Success */}

          {message && (
            <div className="verification-success">
              {message}
            </div>
          )}

          {/* Verify Button */}

          <button
            type="submit"
            className="verification-submit"
            disabled={
              loading ||
              code.length !== 6
            }
          >
            {loading
              ? "جاري التحقق..."
              : "تأكيد البريد الإلكتروني"}
          </button>

        </form>

        {/* Resend */}

        <div className="resend-section">

          <p>
            لم يصلك الكود؟
          </p>

          <button
            type="button"
            className="resend-btn"
            onClick={handleResend}
            disabled={resending}
          >
            <FaRedo />

            {resending
              ? "جاري الإرسال..."
              : "إعادة إرسال الكود"}
          </button>

        </div>

        {/* Back */}

        <button
          type="button"
          className="verification-back"
          onClick={handleBack}
        >
          <FaArrowRight />

          تغيير البريد الإلكتروني
        </button>

        {redirecting && (
          <div className="verification-success-box">
            <h3>تم تأكيد البريد الإلكتروني بنجاح ✅</h3>

            <p>
              حسابك الآن في انتظار موافقة المدرس.
            </p>

            <p>
              سيتم تحويلك إلى صفحة تسجيل الدخول خلال
              <strong> {countdown} </strong>
              ثوانٍ...
            </p>
          </div>
        )}

        {/* Footer */}

        <div className="verification-footer">
          الكود صالح لمدة 10 دقائق فقط
        </div>

      </div>

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