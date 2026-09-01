import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import api from "../../api/axios";

import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiPlay,
} from "react-icons/fi";

import "./ExamPlayer.css";

export default function ExamPlayer() {
  const { examId } = useParams();
  const navigate = useNavigate();

  // ==================================================
  // State
  // ==================================================

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [examLocked, setExamLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // ==================================================
  // Refs
  // ==================================================

  const startedRef = useRef(false);
  const submittingRef = useRef(false);
  const pausingRef = useRef(false);
  const resumingRef = useRef(false);

  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const answerSaveTimeoutRef = useRef(null);

  const answersRef = useRef({});
  const timeRef = useRef(0);
  const attemptRef = useRef(null);

  const isPausedRef = useRef(false);
  const examLockedRef = useRef(false);
  const currentRef = useRef(0);

  // ==================================================
  // IMPORTANT:
  // Server expiration timestamp is authoritative.
  // ==================================================

  const expiresAtRef = useRef(null);

  // ==================================================
  // LocalStorage Key
  // ==================================================

  const getStorageKey = useCallback(
    (id = attemptRef.current?._id) => {
      if (!id) {
        return null;
      }

      return `exam_attempt_${id}`;
    },
    []
  );

  // ==================================================
  // Update Refs
  // ==================================================

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    examLockedRef.current = examLocked;
  }, [examLocked]);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // ==================================================
  // Save Local Backup
  // ==================================================

  const saveLocalBackup = useCallback(
    (
      customAnswers = answersRef.current,
      customTime = timeRef.current,
      customStatus = isPausedRef.current
        ? "paused"
        : "in_progress",
      customCurrent = currentRef.current
    ) => {
      const currentAttempt = attemptRef.current;

      if (!currentAttempt?._id) {
        return;
      }

      const key = getStorageKey(
        currentAttempt._id
      );

      if (!key) {
        return;
      }

      try {
        const backup = {
          attemptId: currentAttempt._id,
          examId,

          answers:
            customAnswers || {},

          remainingTime: Math.max(
            0,
            Math.floor(
              Number(customTime) || 0
            )
          ),

          currentQuestion: Math.max(
            0,
            Number(customCurrent) || 0
          ),

          status: customStatus,

          savedAt: Date.now(),
        };

        localStorage.setItem(
          key,
          JSON.stringify(backup)
        );
      } catch (error) {
        console.log(
          "LOCAL BACKUP ERROR:",
          error
        );
      }
    },
    [examId, getStorageKey]
  );

  // ==================================================
  // Load Local Backup
  // ==================================================

  const loadLocalBackup = useCallback(
    (attemptId) => {
      try {
        const key =
          getStorageKey(attemptId);

        if (!key) {
          return null;
        }

        const raw =
          localStorage.getItem(key);

        if (!raw) {
          return null;
        }

        const parsed =
          JSON.parse(raw);

        if (
          !parsed ||
          parsed.attemptId !== attemptId
        ) {
          return null;
        }

        return parsed;
      } catch (error) {
        console.log(
          "LOAD LOCAL BACKUP ERROR:",
          error
        );

        return null;
      }
    },
    [getStorageKey]
  );

  // ==================================================
  // Delete Local Backup
  // ==================================================

  const clearLocalBackup = useCallback(
    (attemptId) => {
      try {
        const key =
          getStorageKey(attemptId);

        if (key) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.log(
          "CLEAR LOCAL BACKUP ERROR:",
          error
        );
      }
    },
    [getStorageKey]
  );

  // ==================================================
  // Get Formatted Answers
  // ==================================================

  const getFormattedAnswers = useCallback(
    () => {
      const currentAnswers =
        answersRef.current || {};

      return Object.keys(
        currentAnswers
      ).map((id) => {
        const value =
          currentAnswers[id];

        // ==================================================
        // Essay
        // ==================================================

        if (
          value &&
          typeof value === "object" &&
          value.essayAnswer !== undefined
        ) {
          return {
            questionId: id,
            essayAnswer:
              value.essayAnswer || "",
          };
        }

        // ==================================================
        // Other
        // ==================================================

        return {
          questionId: id,

          selectedAnswers:
            Array.isArray(value)
              ? value
              : value !== undefined
              ? [value]
              : [],
        };
      });
    },
    []
  );

  // ==================================================
  // Submit Exam
  // ==================================================

  const submitExam = useCallback(
    async (autoSubmit = false) => {
      if (
        !attemptRef.current ||
        submittingRef.current
      ) {
        return;
      }

      submittingRef.current = true;

      try {
        const formattedAnswers =
          getFormattedAnswers();

        const currentTime = Math.max(
          0,
          Math.floor(
            Number(timeRef.current) || 0
          )
        );

        // ==================================================
        // Auto Submit
        // ==================================================

        if (autoSubmit) {
          examLockedRef.current = true;
          setExamLocked(true);

          timeRef.current = 0;
          setTime(0);
        }

        // ==================================================
        // Local Backup
        // ==================================================

        saveLocalBackup(
          answersRef.current,
          currentTime,
          "submitted",
          currentRef.current
        );

        // ==================================================
        // Submit
        // ==================================================

        const { data } =
          await api.post(
            `/exam-attempt/${attemptRef.current._id}/submit`,
            {
              answers:
                formattedAnswers,

              isAutoSubmitted:
                autoSubmit,
            }
          );

        if (data.success) {
          clearLocalBackup(
            attemptRef.current._id
          );

          navigate(
            `/exam-result/${examId}`,
            {
              replace: true,
            }
          );

          return;
        }

        submittingRef.current = false;

        if (!autoSubmit) {
          examLockedRef.current = false;
          setExamLocked(false);
        }

        alert(
          data.message ||
            "حدث خطأ أثناء تسليم الامتحان"
        );
      } catch (error) {
        console.log(
          "SUBMIT ERROR:",
          error.response?.data ||
            error
        );

        submittingRef.current = false;

        if (!autoSubmit) {
          examLockedRef.current = false;
          setExamLocked(false);
        }
      }
    },
    [
      clearLocalBackup,
      examId,
      getFormattedAnswers,
      navigate,
      saveLocalBackup,
    ]
  );

  // ==================================================
  // Load Attempt
  // ==================================================

  const loadAttempt = async (id) => {
    try {
      const { data } =
        await api.get(
          `/exam-attempt/${id}`
        );

      console.log(
        "LOAD ATTEMPT:",
        data
      );

      if (!data.success) {
        setLoading(false);
        return;
      }

      const serverAttempt =
        data.attempt;

      // ==================================================
      // Local Backup
      // ==================================================

      const localBackup =
        loadLocalBackup(
          serverAttempt._id
        );

      console.log(
        "LOCAL BACKUP:",
        localBackup
      );

      // ==================================================
      // Server Attempt
      // ==================================================

      attemptRef.current =
        serverAttempt;

      setAttempt(serverAttempt);

      // ==================================================
      // Status
      // ==================================================

      const paused =
        serverAttempt.status ===
        "paused";

      const locked =
        serverAttempt.status ===
          "submitted" ||
        serverAttempt.status ===
          "reviewed";

      isPausedRef.current =
        paused;

      examLockedRef.current =
        locked;

      setIsPaused(paused);
      setExamLocked(locked);

      // ==================================================
      // Questions
      // ==================================================

      if (
        !data.questions ||
        !Array.isArray(
          data.questions
        ) ||
        data.questions.length === 0
      ) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      setQuestions(
        data.questions
      );

      // ==================================================
      // Restore Server Answers
      // ==================================================

      const restoredAnswers = {};

      const serverAnswers =
        serverAttempt.answers || [];

      serverAnswers.forEach(
        (answer) => {
          const questionId =
            String(
              answer.questionId
            );

          // ==================================================
          // Essay
          // ==================================================

          if (
            answer.essayAnswer !==
            undefined
          ) {
            restoredAnswers[
              questionId
            ] = {
              essayAnswer:
                answer.essayAnswer ||
                "",
            };

            return;
          }

          // ==================================================
          // Other
          // ==================================================

          restoredAnswers[
            questionId
          ] =
            Array.isArray(
              answer.selectedAnswers
            )
              ? answer.selectedAnswers
              : [];
        }
      );

      // ==================================================
      // Restore Answers From Local
      // ==================================================

      let finalAnswers =
        restoredAnswers;

      if (
        localBackup &&
        localBackup.answers &&
        typeof localBackup.answers ===
          "object"
      ) {
        const localSavedAt =
          Number(
            localBackup.savedAt
          ) || 0;

        const serverUpdatedAt =
          serverAttempt.updatedAt
            ? new Date(
                serverAttempt.updatedAt
              ).getTime()
            : 0;

        if (
          localSavedAt >
          serverUpdatedAt
        ) {
          finalAnswers =
            localBackup.answers;

          console.log(
            "ANSWERS SOURCE: LOCAL BACKUP"
          );
        } else {
          console.log(
            "ANSWERS SOURCE: SERVER"
          );
        }
      } else {
        console.log(
          "ANSWERS SOURCE: SERVER"
        );
      }

      answersRef.current =
        finalAnswers;

      setAnswers(
        finalAnswers
      );

      // ==================================================
      // Restore Current Question
      // ==================================================

      if (
        localBackup &&
        Number.isFinite(
          Number(
            localBackup.currentQuestion
          )
        )
      ) {
        const savedQuestion =
          Math.max(
            0,
            Math.min(
              Number(
                localBackup.currentQuestion
              ),
              data.questions.length - 1
            )
          );

        currentRef.current =
          savedQuestion;

        setCurrent(
          savedQuestion
        );
      }

      // ==================================================
      // SUBMITTED / REVIEWED
      // ==================================================

      if (locked) {
        expiresAtRef.current = null;

        timeRef.current = 0;

        setTime(0);

        clearLocalBackup(
          serverAttempt._id
        );

        return;
      }

      // ==================================================
      // PAUSED
      // ==================================================

      if (paused) {
        expiresAtRef.current = null;

        const pausedRemaining =
          Math.max(
            0,
            Math.floor(
              Number(
                serverAttempt.remainingTime
              ) || 0
            )
          );

        timeRef.current =
          pausedRemaining;

        setTime(
          pausedRemaining
        );

        saveLocalBackup(
          finalAnswers,
          pausedRemaining,
          "paused",
          currentRef.current
        );

        return;
      }

      // ==================================================
      // IN PROGRESS
      // ==================================================

      if (
        serverAttempt.status ===
        "in_progress"
      ) {
        let remainingTime = 0;

        // ==================================================
        // SERVER expiresAt IS AUTHORITATIVE
        // ==================================================

        if (
          serverAttempt.expiresAt
        ) {
          const expiresAtMs =
            new Date(
              serverAttempt.expiresAt
            ).getTime();

          if (
            Number.isFinite(
              expiresAtMs
            )
          ) {
            expiresAtRef.current =
              expiresAtMs;

            remainingTime =
              Math.max(
                0,
                Math.ceil(
                  (
                    expiresAtMs -
                    Date.now()
                  ) / 1000
                )
              );
          } else {
            expiresAtRef.current =
              null;
          }
        }

        // ==================================================
        // FALLBACK
        // Only if expiresAt is missing/invalid
        // ==================================================

        if (
          !expiresAtRef.current
        ) {
          remainingTime =
            Math.max(
              0,
              Math.floor(
                Number(
                  serverAttempt.remainingTime
                ) || 0
              )
            );
        }

        console.log(
          "TIME DEBUG:",
          {
            status:
              serverAttempt.status,

            remainingTime,

            serverRemainingTime:
              serverAttempt.remainingTime,

            expiresAt:
              serverAttempt.expiresAt,

            expiresAtRef:
              expiresAtRef.current,

            now:
              new Date().toISOString(),
          }
        );

        timeRef.current =
          remainingTime;

        setTime(
          remainingTime
        );

        // ==================================================
        // IMPORTANT:
        // Local backup gets the SERVER time.
        // LocalStorage cannot override server time.
        // ==================================================

        saveLocalBackup(
          finalAnswers,
          remainingTime,
          "in_progress",
          currentRef.current
        );

        // ==================================================
        // Time Expired
        // ==================================================

        if (
          remainingTime <= 0
        ) {
          console.log(
            "EXAM TIME EXPIRED:",
            {
              expiresAt:
                serverAttempt.expiresAt,

              remainingTime,

              now:
                new Date().toISOString(),
            }
          );

          examLockedRef.current =
            true;

          setExamLocked(true);

          setTimeout(() => {
            submitExam(true);
          }, 100);

          return;
        }
      }
    } catch (error) {
      console.log(
        "LOAD ATTEMPT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // Start Exam
  // ==================================================

  const startExam = async () => {
    try {
      setLoading(true);

      const { data } =
        await api.post(
          `/exam-attempt/start/${examId}`
        );

      console.log(
        "START EXAM:",
        data
      );

      if (!data.success) {
        alert(
          data.message ||
            "لا يمكن بدء الامتحان"
        );

        navigate(-1);
        return;
      }

      const serverAttempt =
        data.attempt;

      // ==================================================
      // Backend says this attempt already expired
      // ==================================================

      if (
        data.expired === true
      ) {
        console.log(
          "SERVER RETURNED EXPIRED ATTEMPT:",
          serverAttempt
        );

        attemptRef.current =
          serverAttempt;

        setAttempt(
          serverAttempt
        );

        expiresAtRef.current =
          null;

        timeRef.current = 0;

        setTime(0);

        isPausedRef.current =
          false;

        examLockedRef.current =
          true;

        setIsPaused(false);
        setExamLocked(true);

        clearLocalBackup(
          serverAttempt._id
        );

        setLoading(false);

        alert(
          "انتهى وقت هذا الامتحان وتم تسليمه تلقائيًا"
        );

        navigate(
          `/exam-result/${examId}`,
          {
            replace: true,
          }
        );

        return;
      }

      attemptRef.current =
        serverAttempt;

      setAttempt(
        serverAttempt
      );

      // ==================================================
      // Paused
      // ==================================================

      if (
        serverAttempt.status ===
        "paused"
      ) {
        expiresAtRef.current =
          null;

        const pausedTime =
          Number(
            serverAttempt.remainingTime
          ) || 0;

        setIsPaused(true);

        isPausedRef.current =
          true;

        setTime(
          pausedTime
        );

        timeRef.current =
          pausedTime;
      }

      // ==================================================
      // Submitted / Reviewed
      // ==================================================

      if (
        serverAttempt.status ===
          "submitted" ||
        serverAttempt.status ===
          "reviewed"
      ) {
        expiresAtRef.current =
          null;

        setExamLocked(true);

        examLockedRef.current =
          true;
      }

      await loadAttempt(
        serverAttempt._id
      );
    } catch (error) {
      console.log(
        "START EXAM ERROR:",
        error
      );

      const message =
        error.response?.data?.message ||
        "حدث خطأ أثناء فتح الامتحان";

      alert(message);

      navigate(-1);
    }
  };

  // ==================================================
  // Initial Start
  // ==================================================

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    startExam();
  }, []);

  // ==================================================
  // Select Answer
  // ==================================================

  const selectAnswer = (
    question,
    type,
    value
  ) => {
    if (
      examLockedRef.current ||
      isPausedRef.current
    ) {
      return;
    }

    setAnswers((prev) => {
      let updated;

      // ==================================================
      // MCQ / True False
      // ==================================================

      if (
        type === "mcq" ||
        type === "trueFalse"
      ) {
        updated = {
          ...prev,
          [question._id]: [value],
        };
      }

      // ==================================================
      // Checkbox
      // ==================================================

      else if (
        type === "checkbox"
      ) {
        const old =
          prev[
            question._id
          ] || [];

        if (
          old.includes(value)
        ) {
          updated = {
            ...prev,
            [question._id]:
              old.filter(
                (x) =>
                  x !== value
              ),
          };
        } else {
          updated = {
            ...prev,
            [question._id]: [
              ...old,
              value,
            ],
          };
        }
      } else {
        updated = prev;
      }

      answersRef.current =
        updated;

      saveLocalBackup(
        updated,
        timeRef.current,
        "in_progress",
        currentRef.current
      );

      return updated;
    });
  };

  // ==================================================
  // Essay
  // ==================================================

  const handleEssayAnswer = (
    questionId,
    value
  ) => {
    if (
      examLockedRef.current ||
      isPausedRef.current
    ) {
      return;
    }

    setAnswers((prev) => {
      const updated = {
        ...prev,

        [questionId]: {
          essayAnswer: value,
        },
      };

      answersRef.current =
        updated;

      saveLocalBackup(
        updated,
        timeRef.current,
        "in_progress",
        currentRef.current
      );

      return updated;
    });
  };

  // ==================================================
  // Navigation
  // ==================================================

  const goToQuestion =
    useCallback(
      (newIndex) => {
        if (
          examLockedRef.current ||
          isPausedRef.current
        ) {
          return;
        }

        const safeIndex =
          Math.max(
            0,
            Math.min(
              newIndex,
              questions.length - 1
            )
          );

        currentRef.current =
          safeIndex;

        setCurrent(
          safeIndex
        );

        saveLocalBackup(
          answersRef.current,
          timeRef.current,
          "in_progress",
          safeIndex
        );
      },
      [
        questions.length,
        saveLocalBackup,
      ]
    );

  // ==================================================
  // Save Answers
  // ==================================================

  const saveAnswers =
    useCallback(
      async (force = false) => {
        const currentAttempt =
          attemptRef.current;

        if (!currentAttempt) {
          return false;
        }

        if (
          !force &&
          (
            submittingRef.current ||
            examLockedRef.current
          )
        ) {
          return false;
        }

        // ==================================================
        // IMPORTANT:
        // Never save to server after timer reaches zero.
        // This prevents a race with auto-submit.
        // ==================================================

        const remainingTime =
          Math.max(
            0,
            Math.floor(
              Number(
                timeRef.current
              ) || 0
            )
          );

        if (
          !force &&
          remainingTime <= 0
        ) {
          return false;
        }

        const formattedAnswers =
          getFormattedAnswers();

        // ==================================================
        // LOCAL FIRST
        // ==================================================

        saveLocalBackup(
          answersRef.current,
          remainingTime,
          isPausedRef.current
            ? "paused"
            : "in_progress",
          currentRef.current
        );

        try {
          await api.put(
            `/exam-attempt/${currentAttempt._id}/save`,
            {
              answers:
                formattedAnswers,

              remainingTime,
            }
          );

          return true;
        } catch (error) {
          console.log(
            "SAVE ANSWERS ERROR:",
            error.response?.data ||
              error
          );

          return false;
        }
      },
      [
        getFormattedAnswers,
        saveLocalBackup,
      ]
    );

  // ==================================================
  // Pause Exam
  // ==================================================

  const pauseExam =
    useCallback(
      async (silent = false) => {
        const currentAttempt =
          attemptRef.current;

        if (
          !currentAttempt ||
          currentAttempt.status ===
            "submitted" ||
          currentAttempt.status ===
            "reviewed" ||
          submittingRef.current ||
          pausingRef.current
        ) {
          return false;
        }

        if (
          isPausedRef.current
        ) {
          return true;
        }

        pausingRef.current =
          true;

        // ==================================================
        // Stop Timer
        // ==================================================

        if (
          timerRef.current
        ) {
          clearInterval(
            timerRef.current
          );

          timerRef.current =
            null;
        }

        // ==================================================
        // Calculate Current Server-Based Time
        // ==================================================

        let remainingTime =
          Math.max(
            0,
            Math.floor(
              Number(
                timeRef.current
              ) || 0
            )
          );

        if (
          expiresAtRef.current
        ) {
          remainingTime =
            Math.max(
              0,
              Math.ceil(
                (
                  expiresAtRef.current -
                  Date.now()
                ) / 1000
              )
            );
        }

        const currentAnswers =
          getFormattedAnswers();

        // ==================================================
        // Local Backup
        // ==================================================

        saveLocalBackup(
          answersRef.current,
          remainingTime,
          "paused",
          currentRef.current
        );

        // ==================================================
        // Pause Locally
        // ==================================================

        isPausedRef.current =
          true;

        setIsPaused(true);

        try {
          await api.post(
            `/exam-attempt/${currentAttempt._id}/pause`,
            {
              answers:
                currentAnswers,

              remainingTime,
            }
          );

          attemptRef.current = {
            ...attemptRef.current,

            status: "paused",

            remainingTime,

            expiresAt: null,

            pausedAt:
              new Date().toISOString(),
          };

          setAttempt(
            attemptRef.current
          );

          expiresAtRef.current =
            null;

          if (!silent) {
            console.log(
              "⏸️ EXAM PAUSED"
            );
          }

          return true;
        } catch (error) {
          console.log(
            "PAUSE EXAM ERROR:",
            error.response?.data ||
              error
          );

          isPausedRef.current =
            false;

          setIsPaused(false);

          startTimer();

          return false;
        } finally {
          pausingRef.current =
            false;
        }
      },
      [
        getFormattedAnswers,
        saveLocalBackup,
      ]
    );

  // ==================================================
  // Resume Exam
  // ==================================================

  const resumeExam =
    useCallback(
      async () => {
        const currentAttempt =
          attemptRef.current;

        if (
          !currentAttempt ||
          resumingRef.current ||
          submittingRef.current
        ) {
          return;
        }

        if (
          !isPausedRef.current
        ) {
          return;
        }

        resumingRef.current =
          true;

        try {
          const { data } =
            await api.post(
              `/exam-attempt/${currentAttempt._id}/resume`
            );

          console.log(
            "RESUME EXAM:",
            data
          );

          if (!data.success) {
            alert(
              data.message ||
                "لا يمكن استكمال الامتحان"
            );

            return;
          }

          // ==================================================
          // Expired
          // ==================================================

          if (
            data.expired
          ) {
            isPausedRef.current =
              false;

            examLockedRef.current =
              true;

            setIsPaused(false);
            setExamLocked(true);

            setTime(0);

            timeRef.current = 0;

            expiresAtRef.current =
              null;

            clearLocalBackup(
              currentAttempt._id
            );

            alert(
              "انتهى وقت الامتحان وتم تسليمه تلقائيًا"
            );

            navigate(
              `/exam-result/${examId}`,
              {
                replace: true,
              }
            );

            return;
          }

          // ==================================================
          // Update Attempt
          // ==================================================

          const updatedAttempt =
            data.attempt;

          attemptRef.current =
            updatedAttempt;

          setAttempt(
            updatedAttempt
          );

          // ==================================================
          // Calculate Resumed Time
          // ==================================================

          let remaining = 0;

          if (
            updatedAttempt.expiresAt
          ) {
            const expiresAtMs =
              new Date(
                updatedAttempt.expiresAt
              ).getTime();

            if (
              Number.isFinite(
                expiresAtMs
              )
            ) {
              expiresAtRef.current =
                expiresAtMs;

              remaining =
                Math.max(
                  0,
                  Math.ceil(
                    (
                      expiresAtMs -
                      Date.now()
                    ) / 1000
                  )
                );
            }
          }

          if (
            !expiresAtRef.current
          ) {
            remaining =
              Math.max(
                0,
                Math.floor(
                  Number(
                    updatedAttempt.remainingTime
                  ) || 0
                )
              );
          }

          // ==================================================
          // Still Expired
          // ==================================================

          if (
            remaining <= 0
          ) {
            isPausedRef.current =
              false;

            examLockedRef.current =
              true;

            setIsPaused(false);
            setExamLocked(true);

            timeRef.current = 0;
            setTime(0);

            clearLocalBackup(
              currentAttempt._id
            );

            alert(
              "انتهى وقت الامتحان وتم تسليمه تلقائيًا"
            );

            navigate(
              `/exam-result/${examId}`,
              {
                replace: true,
              }
            );

            return;
          }

          // ==================================================
          // Update Timer
          // ==================================================

          timeRef.current =
            remaining;

          setTime(
            remaining
          );

          isPausedRef.current =
            false;

          setIsPaused(false);

          examLockedRef.current =
            false;

          setExamLocked(false);

          saveLocalBackup(
            answersRef.current,
            remaining,
            "in_progress",
            currentRef.current
          );

          startTimer(
            updatedAttempt
          );
        } catch (error) {
          console.log(
            "RESUME EXAM ERROR:",
            error.response?.data ||
              error
          );

          alert(
            error.response?.data?.message ||
              "حدث خطأ أثناء استكمال الامتحان"
          );
        } finally {
          resumingRef.current =
            false;
        }
      },
      [
        clearLocalBackup,
        examId,
        navigate,
        saveLocalBackup,
      ]
    );

  // ==================================================
  // Timer
  // ==================================================

  const startTimer =
    useCallback(
      (
        customAttempt =
          attemptRef.current
      ) => {
        if (!customAttempt) {
          return;
        }

        if (
          customAttempt.status !==
            "in_progress" ||
          isPausedRef.current ||
          examLockedRef.current
        ) {
          return;
        }

        if (
          timerRef.current
        ) {
          clearInterval(
            timerRef.current
          );

          timerRef.current =
            null;
        }

        const tick = () => {
          if (
            isPausedRef.current ||
            examLockedRef.current ||
            submittingRef.current
          ) {
            return;
          }

          let remainingTime = 0;

          // ==================================================
          // SERVER EXPIRATION IS AUTHORITATIVE
          // ==================================================

          if (
            expiresAtRef.current
          ) {
            remainingTime =
              Math.max(
                0,
                Math.ceil(
                  (
                    expiresAtRef.current -
                    Date.now()
                  ) / 1000
                )
              );
          } else {
            // ==================================================
            // Fallback
            // ==================================================

            remainingTime =
              Math.max(
                0,
                Number(
                  timeRef.current
                ) - 1
              );
          }

          timeRef.current =
            remainingTime;

          setTime(
            remainingTime
          );

          // ==================================================
          // Local Backup
          // ==================================================

          saveLocalBackup(
            answersRef.current,
            remainingTime,
            "in_progress",
            currentRef.current
          );

          // ==================================================
          // Time Ended
          // ==================================================

          if (
            remainingTime <= 0
          ) {
            if (
              timerRef.current
            ) {
              clearInterval(
                timerRef.current
              );

              timerRef.current =
                null;
            }

            examLockedRef.current =
              true;

            setExamLocked(true);

            expiresAtRef.current =
              null;

            submitExam(true);
          }
        };

        // ==================================================
        // Run Once Immediately
        // ==================================================

        tick();

        // ==================================================
        // Then Every Second
        // ==================================================

        if (
          !examLockedRef.current &&
          !isPausedRef.current &&
          !submittingRef.current
        ) {
          timerRef.current =
            setInterval(
              tick,
              1000
            );
        }
      },
      [
        saveLocalBackup,
        submitExam,
      ]
    );

  // ==================================================
  // Start Timer After Loading
  // ==================================================

  useEffect(() => {
    if (
      !attempt ||
      loading
    ) {
      return;
    }

    if (
      attempt.status ===
        "in_progress" &&
      !isPaused
    ) {
      startTimer(
        attempt
      );
    }

    return () => {
      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    };
  }, [
    attempt?._id,
    attempt?.status,
    loading,
    isPaused,
    startTimer,
  ]);

  // ==================================================
  // Auto Save Every 2 Seconds
  // ==================================================

  useEffect(() => {
    if (
      !attempt ||
      examLocked ||
      isPaused
    ) {
      return;
    }

    autoSaveRef.current =
      setInterval(
        () => {
          saveAnswers();
        },
        2000
      );

    return () => {
      if (
        autoSaveRef.current
      ) {
        clearInterval(
          autoSaveRef.current
        );

        autoSaveRef.current =
          null;
      }
    };
  }, [
    attempt?._id,
    examLocked,
    isPaused,
    saveAnswers,
  ]);

  // ==================================================
  // Save Immediately After Answer Change
  // ==================================================

  useEffect(() => {
    if (
      !attempt ||
      examLocked ||
      isPaused
    ) {
      return;
    }

    if (
      answerSaveTimeoutRef.current
    ) {
      clearTimeout(
        answerSaveTimeoutRef.current
      );
    }

    answerSaveTimeoutRef.current =
      setTimeout(
        () => {
          saveAnswers();
        },
        500
      );

    return () => {
      if (
        answerSaveTimeoutRef.current
      ) {
        clearTimeout(
          answerSaveTimeoutRef.current
        );

        answerSaveTimeoutRef.current =
          null;
      }
    };
  }, [
    answers,
    attempt?._id,
    examLocked,
    isPaused,
    saveAnswers,
  ]);

  // ==================================================
  // Visibility Change
  // ==================================================

  useEffect(() => {
    const handleVisibilityChange =
      async () => {
        // ==================================================
        // Student Left Tab
        // ==================================================

        if (
          document.visibilityState ===
          "hidden"
        ) {
          if (
            attemptRef.current &&
            attemptRef.current.status ===
              "in_progress" &&
            !submittingRef.current &&
            !isPausedRef.current
          ) {
            let remainingTime =
              Math.max(
                0,
                Math.floor(
                  Number(
                    timeRef.current
                  ) || 0
                )
              );

            if (
              expiresAtRef.current
            ) {
              remainingTime =
                Math.max(
                  0,
                  Math.ceil(
                    (
                      expiresAtRef.current -
                      Date.now()
                    ) / 1000
                  )
                );
            }

            saveLocalBackup(
              answersRef.current,
              remainingTime,
              "paused",
              currentRef.current
            );

            pauseExam(true);
          }

          return;
        }

        // ==================================================
        // Student Returned
        // ==================================================

        if (
          document.visibilityState ===
          "visible"
        ) {
          if (
            attemptRef.current &&
            (
              attemptRef.current.status ===
                "paused" ||
              isPausedRef.current
            )
          ) {
            setIsPaused(true);

            isPausedRef.current =
              true;
          }
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    pauseExam,
    saveLocalBackup,
  ]);

  // ==================================================
  // Before Unload
  // ==================================================

  useEffect(() => {
    const handleBeforeUnload =
      () => {
        if (
          !attemptRef.current ||
          submittingRef.current ||
          examLockedRef.current
        ) {
          return;
        }

        let remainingTime =
          Math.max(
            0,
            Math.floor(
              Number(
                timeRef.current
              ) || 0
            )
          );

        if (
          expiresAtRef.current
        ) {
          remainingTime =
            Math.max(
              0,
              Math.ceil(
                (
                  expiresAtRef.current -
                  Date.now()
                ) / 1000
              )
            );
        }

        const formattedAnswers =
          getFormattedAnswers();

        // ==================================================
        // LOCAL BACKUP
        // ==================================================

        saveLocalBackup(
          answersRef.current,
          remainingTime,
          "paused",
          currentRef.current
        );

        // ==================================================
        // SERVER BACKUP
        // ==================================================

        const token =
          localStorage.getItem(
            "token"
          );

        const rawApiUrl =
          import.meta.env.VITE_API_URL;

        if (
          !token ||
          !rawApiUrl
        ) {
          return;
        }

        const apiUrl =
          rawApiUrl.replace(
            /\/+$/,
            ""
          );

        try {
          fetch(
            `${apiUrl}/api/exam-attempt/${attemptRef.current._id}/pause`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  answers:
                    formattedAnswers,

                  remainingTime,
                }),

              keepalive: true,
            }
          );
        } catch (error) {
          console.log(
            "BEFORE UNLOAD PAUSE ERROR:",
            error
          );
        }
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    getFormattedAnswers,
    saveLocalBackup,
  ]);

  // ==================================================
  // Format Time
  // ==================================================

  const formatTime = () => {
    const safeTime =
      Number(time);

    if (
      !Number.isFinite(
        safeTime
      ) ||
      safeTime < 0
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(
        safeTime / 60
      );

    const seconds =
      safeTime % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ==================================================
  // Loading
  // ==================================================

  if (loading) {
    return (
      <div className="exam-loading">
        جاري تجهيز الامتحان...
      </div>
    );
  }

  // ==================================================
  // No Questions
  // ==================================================

  const q =
    questions[current];

  if (!q) {
    return (
      <div className="exam-loading">
        لا توجد أسئلة
      </div>
    );
  }

  // ==================================================
  // PAUSED SCREEN
  // ==================================================

  if (
    isPaused &&
    !examLocked
  ) {
    return (
      <div className="exam-loading">
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
            }}
          >
            ⏸️
          </div>

          <h2>
            الامتحان متوقف مؤقتًا
          </h2>

          <p
            style={{
              marginTop: "12px",
              marginBottom: "25px",
            }}
          >
            تم حفظ إجاباتك
            <br />
            والوقت متوقف
          </p>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "25px",
            }}
          >
            <FiClock />{" "}
            {formatTime()}
          </div>

          <button
            type="button"
            onClick={resumeExam}
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: "8px",
              padding:
                "14px 28px",
              border: "none",
              borderRadius:
                "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            <FiPlay />
            استكمال الامتحان
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="exam-player">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="exam-player-header">
        <h1>
          {attempt?.examId?.title}
        </h1>

        <div className="timer">
          <FiClock />
          {formatTime()}
        </div>
      </div>

      {/* ==================================================
          Time Ended
      ================================================== */}

      {examLocked && (
        <div className="exam-time-ended">
          ⏰ انتهى وقت الامتحان

          <span>
            تم تسليم الامتحان تلقائيًا
          </span>
        </div>
      )}

      {/* ==================================================
          Question Card
      ================================================== */}

      <div className="player-card">
        <h2>
          {current + 1}
          {" - "}
          {q.question}
        </h2>

        {/* ==================================================
            Question Image
        ================================================== */}

        {q.image && (
          <div className="question-image-box">
            <img
              src={q.image}
              alt="question"
              className="question-image"
              onClick={() =>
                setPreviewImage(
                  q.image
                )
              }
            />
          </div>
        )}

        {/* ==================================================
            Answers
        ================================================== */}

        <div className="answers-list">

          {/* ==================================================
              Essay
          ================================================== */}

          {q.type === "essay" ? (
            <textarea
              className="essay-answer"
              rows={8}
              placeholder="اكتب إجابتك هنا..."
              value={
                answers[
                  q._id
                ]?.essayAnswer ||
                ""
              }
              onChange={(e) =>
                handleEssayAnswer(
                  q._id,
                  e.target.value
                )
              }
              disabled={
                examLocked ||
                isPaused
              }
            />
          ) : (
            q.options?.map(
              (
                op,
                index
              ) => (
                <button
                  key={index}
                  type="button"
                  disabled={
                    examLocked ||
                    isPaused
                  }
                  className={
                    Array.isArray(
                      answers[
                        q._id
                      ]
                    ) &&
                    answers[
                      q._id
                    ].includes(
                      index
                    )
                      ? "answer-selected"
                      : ""
                  }
                  onClick={() =>
                    selectAnswer(
                      q,
                      q.type,
                      index
                    )
                  }
                >
                  {op.text}
                </button>
              )
            )
          )}
        </div>
      </div>

      {/* ==================================================
          Navigation
      ================================================== */}

      <div className="player-actions">

        <button
          disabled={
            current === 0 ||
            examLocked ||
            isPaused
          }
          onClick={() =>
            goToQuestion(
              current - 1
            )
          }
        >
          <FiChevronRight />
          السابق
        </button>

        {current ===
        questions.length - 1 ? (
          <button
            className="submit"
            disabled={
              examLocked ||
              isPaused
            }
            onClick={() =>
              submitExam(false)
            }
          >
            <FiSend />
            تسليم الامتحان
          </button>
        ) : (
          <button
            disabled={
              examLocked ||
              isPaused
            }
            onClick={() =>
              goToQuestion(
                current + 1
              )
            }
          >
            التالي
            <FiChevronLeft />
          </button>
        )}
      </div>

      {/* ==================================================
          Image Preview
      ================================================== */}

      {previewImage && (
        <div
          className="image-modal"
          onClick={() =>
            setPreviewImage(null)
          }
        >
          <img
            src={previewImage}
            alt=""
            className="image-modal-content"
          />
        </div>
      )}
    </div>
  );
}