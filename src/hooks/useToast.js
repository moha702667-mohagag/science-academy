import { useCallback, useState } from "react";

export default function useToast() {

  const [toast, setToast] = useState(null);


  // ==================================================
  // CLOSE
  // ==================================================

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);


  // ==================================================
  // NORMAL TOAST
  // ==================================================

  const showToast = useCallback(
    ({
      type = "info",
      title = "",
      message = "",
    }) => {

      setToast({
        type,
        title,
        message,
        confirm: false,
      });

    },
    []
  );


  // ==================================================
  // SUCCESS
  // ==================================================

  const success = useCallback(
    (message, title = "تم بنجاح") => {

      showToast({
        type: "success",
        title,
        message,
      });

    },
    [showToast]
  );


  // ==================================================
  // ERROR
  // ==================================================

  const error = useCallback(
    (message, title = "حدث خطأ") => {

      showToast({
        type: "error",
        title,
        message,
      });

    },
    [showToast]
  );


  // ==================================================
  // WARNING
  // ==================================================

  const warning = useCallback(
    (message, title = "تنبيه") => {

      showToast({
        type: "warning",
        title,
        message,
      });

    },
    [showToast]
  );


  // ==================================================
  // INFO
  // ==================================================

  const info = useCallback(
    (message, title = "معلومة") => {

      showToast({
        type: "info",
        title,
        message,
      });

    },
    [showToast]
  );


    // ==================================================
  // CONFIRM
  // ==================================================

  const confirm = useCallback(
    ({
      title = "تأكيد العملية",
      message = "هل أنت متأكد من تنفيذ هذه العملية؟",
      confirmText = "تأكيد",
      cancelText = "إلغاء",
      showCancel = true,
      onConfirm,
      onCancel,
    }) => {
      setToast({
        type: "warning",
        title,
        message,
        confirm: true,
        confirmText,
        cancelText,
        showCancel,

        onConfirm: async () => {
          closeToast();

          if (onConfirm) {
            await onConfirm();
          }
        },

        onCancel: () => {
          closeToast();

          if (onCancel) {
            onCancel();
          }
        },
      });
    },
    [closeToast]
  );

  // ==================================================
  // RETURN
  // ==================================================

  return {
    toast,

    success,
    error,
    warning,
    info,

    confirm,

    closeToast,
  };
}