import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

import "./Toast.css";


export default function Toast({
  type = "success",
  title,
  message,
  onClose,
  confirm = false,
  onConfirm,
  onCancel,
  confirmText = "نعم، احذف الحساب",
  cancelText = "إلغاء",
  showCancel = true,
}) {

  // ==================================================
  // ICONS
  // ==================================================

  const icons = {

    success: <FaCheckCircle />,

    error: <FaTimesCircle />,

    warning: <FaExclamationTriangle />,

    info: <FaInfoCircle />,

  };


  return (

    <div className={`toast toast-${type}`}>


      {/* ==================================================
          ICON
      ================================================== */}

      <div className="toast-icon">

        {icons[type]}

      </div>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="toast-content">


        {/* TITLE */}

        {title && (

          <h4 className="toast-title">

            {title}

          </h4>

        )}


        {/* MESSAGE */}

        {message && (

          <p className="toast-message">

            {message}

          </p>

        )}


        {/* ==================================================
            CONFIRM ACTIONS
        ================================================== */}

        {confirm && (
          <div className="toast-actions">

            <button
              type="button"
              className="toast-confirm-btn"
              onClick={onConfirm}
            >
              {confirmText}
            </button>

            {showCancel !== false && (
              <button
                type="button"
                className="toast-cancel-btn"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}

          </div>
        )}

      </div>


      {/* ==================================================
          CLOSE
      ================================================== */}

      {!confirm && (

        <button

          type="button"

          className="toast-close"

          onClick={onClose}

          aria-label="إغلاق"

        >

          <FaTimes />

        </button>

      )}


      {/* ==================================================
          PROGRESS
      ================================================== */}

      {!confirm && (

        <div className="toast-progress"></div>

      )}

    </div>

  );

}
