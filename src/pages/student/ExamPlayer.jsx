import {
  useEffect,
  useState,
  useRef,
  useCallback
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import api from "../../api/axios";

import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiPlay
} from "react-icons/fi";

import "./ExamPlayer.css";


export default function ExamPlayer() {

  const { examId } =
    useParams();

  const navigate =
    useNavigate();


  // ==================================================
  // State
  // ==================================================

  const [attempt, setAttempt] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [current, setCurrent] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [time, setTime] =
    useState(0);

  const [examLocked, setExamLocked] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [previewImage, setPreviewImage] =
    useState(null);


  // ==================================================
  // Refs
  // ==================================================

  const startedRef =
    useRef(false);

  const submittingRef =
    useRef(false);

  const pausingRef =
    useRef(false);

  const resumingRef =
    useRef(false);

  const timerRef =
    useRef(null);

  const autoSaveRef =
    useRef(null);

  const answerSaveTimeoutRef =
    useRef(null);

  const answersRef =
    useRef({});

  const timeRef =
    useRef(0);

  const attemptRef =
    useRef(null);

  const isPausedRef =
    useRef(false);

  const examLockedRef =
    useRef(false);

  const currentRef =
    useRef(0);


  // ==================================================
  // LocalStorage Key
  // ==================================================

  const getStorageKey =
    useCallback(
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

    answersRef.current =
      answers;

  }, [answers]);


  useEffect(() => {

    timeRef.current =
      time;

  }, [time]);


  useEffect(() => {

    attemptRef.current =
      attempt;

  }, [attempt]);


  useEffect(() => {

    isPausedRef.current =
      isPaused;

  }, [isPaused]);


  useEffect(() => {

    examLockedRef.current =
      examLocked;

  }, [examLocked]);


  useEffect(() => {

    currentRef.current =
      current;

  }, [current]);


  // ==================================================
  // Save Local Backup
  // ==================================================

  const saveLocalBackup =
    useCallback(
      (
        customAnswers =
          answersRef.current,

        customTime =
          timeRef.current,

        customStatus =
          isPausedRef.current
            ? "paused"
            : "in_progress",

        customCurrent =
          currentRef.current
      ) => {

        const currentAttempt =
          attemptRef.current;

        if (
          !currentAttempt?._id
        ) {
          return;
        }


        const key =
          getStorageKey(
            currentAttempt._id
          );


        if (!key) {
          return;
        }


        try {

          const backup = {

            attemptId:
              currentAttempt._id,

            examId,

            answers:
              customAnswers || {},

            remainingTime:
              Math.max(
                0,
                Math.floor(
                  Number(
                    customTime
                  ) || 0
                )
              ),

            currentQuestion:
              Math.max(
                0,
                Number(
                  customCurrent
                ) || 0
              ),

            status:
              customStatus,

            savedAt:
              Date.now(),

          };


          localStorage.setItem(
            key,
            JSON.stringify(
              backup
            )
          );


        } catch (error) {

          console.log(
            "LOCAL BACKUP ERROR:",
            error
          );

        }

      },
      [
        examId,
        getStorageKey
      ]
    );


  // ==================================================
  // Load Local Backup
  // ==================================================

  const loadLocalBackup =
    useCallback(
      (attemptId) => {

        try {

          const key =
            getStorageKey(
              attemptId
            );


          if (!key) {
            return null;
          }


          const raw =
            localStorage.getItem(
              key
            );


          if (!raw) {
            return null;
          }


          const parsed =
            JSON.parse(
              raw
            );


          if (
            !parsed ||
            parsed.attemptId !==
              attemptId
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
      [
        getStorageKey
      ]
    );


  // ==================================================
  // Delete Local Backup
  // ==================================================

  const clearLocalBackup =
    useCallback(
      (attemptId) => {

        try {

          const key =
            getStorageKey(
              attemptId
            );


          if (key) {

            localStorage.removeItem(
              key
            );

          }

        } catch (error) {

          console.log(
            "CLEAR LOCAL BACKUP ERROR:",
            error
          );

        }

      },
      [
        getStorageKey
      ]
    );


  // ==================================================
  // Start Exam
  // ==================================================

  useEffect(() => {

    if (
      startedRef.current
    ) {

      return;

    }


    startedRef.current =
      true;


    startExam();


  }, []);


  // ==================================================
  // Start / Resume Existing Attempt
  // ==================================================

  const startExam =
    async () => {

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


        if (
          !data.success
        ) {

          alert(
            data.message ||
            "لا يمكن بدء الامتحان"
          );


          navigate(-1);

          return;

        }


        const serverAttempt =
          data.attempt;


        attemptRef.current =
          serverAttempt;


        setAttempt(
          serverAttempt
        );


        // ==================================================
        // لو المحاولة Paused
        // ==================================================

        if (
          serverAttempt.status ===
          "paused"
        ) {

          const pausedTime =
            Number(
              serverAttempt.remainingTime
            ) || 0;


          setIsPaused(
            true
          );

          isPausedRef.current =
            true;


          setTime(
            pausedTime
          );

          timeRef.current =
            pausedTime;

        }


        // ==================================================
        // لو المحاولة منتهية
        // ==================================================

        if (
          serverAttempt.status ===
            "submitted" ||
          serverAttempt.status ===
            "reviewed"
        ) {

          setExamLocked(
            true
          );

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


        alert(
          message
        );


        navigate(-1);

      }

    };


  // ==================================================
  // Load Attempt
  // ==================================================

  const loadAttempt =
    async (id) => {

      try {

        const { data } =
          await api.get(
            `/exam-attempt/${id}`
          );


        console.log(
          "LOAD ATTEMPT:",
          data
        );


        if (
          !data.success
        ) {

          setLoading(
            false
          );

          return;

        }


        const serverAttempt =
          data.attempt;


        // ==================================================
        // Load Local Backup BEFORE changing anything
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


        setAttempt(
          serverAttempt
        );


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


        setIsPaused(
          paused
        );


        setExamLocked(
          locked
        );


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

          setQuestions(
            []
          );

          setLoading(
            false
          );

          return;

        }


        setQuestions(
          data.questions
        );


        // ==================================================
        // Restore Server Answers
        // ==================================================

        const restoredAnswers =
          {};


        const serverAnswers =
          serverAttempt.answers ||
          [];


        serverAnswers.forEach(
          answer => {

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

            }


            // ==================================================
            // Other
            // ==================================================

            else {

              restoredAnswers[
                questionId
              ] =
                Array.isArray(
                  answer.selectedAnswers
                )
                  ? answer.selectedAnswers
                  : [];

            }

          }
        );


        // ==================================================
        // Decide Which Answers Are Newer
        // ==================================================

        let finalAnswers =
          restoredAnswers;


        let localIsNewer =
          false;


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


          /*
            لو الـLocal Backup أحدث من السيرفر
            نستخدمه لأنه ممكن يحتوي على آخر إجابة
            الطالب كتبها قبل Refresh / Close.
          */

          if (
            localSavedAt >
            serverUpdatedAt
          ) {

            localIsNewer =
              true;

            finalAnswers =
              localBackup.answers;

          }

        }


        console.log(
          "ANSWERS SOURCE:",
          localIsNewer
            ? "LOCAL BACKUP"
            : "SERVER"
        );


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
        // Remaining Time
        // ==================================================

        let remainingTime =
          Number(
            serverAttempt.remainingTime
          );


        if (
          !Number.isFinite(
            remainingTime
          )
        ) {

          remainingTime =
            0;

        }


        // ==================================================
        // Restore Local Time
        // ==================================================

        if (
          localBackup &&
          Number.isFinite(
            Number(
              localBackup.remainingTime
            )
          )
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


          /*
            لو الـLocal Backup أحدث
            نستخدم الوقت المحلي أيضًا.

            لكن لا نزيد الوقت عن الوقت الموجود
            في السيرفر لو السيرفر عنده وقت صحيح.
          */

          if (
            localSavedAt >
            serverUpdatedAt
          ) {

            const localTime =
              Math.max(
                0,
                Number(
                  localBackup.remainingTime
                ) || 0
              );


            if (
              remainingTime > 0
            ) {

              remainingTime =
                Math.min(
                  remainingTime,
                  localTime
                );

            } else {

              remainingTime =
                localTime;

            }

          }

        }


        // ==================================================
        // Paused
        // ==================================================

        if (
          paused
        ) {

          /*
            في حالة Pause نعتمد على
            remainingTime الموجود في السيرفر
            لأنه هو الوقت الذي توقف عنده الامتحان.
          */

          remainingTime =
            Number(
              serverAttempt.remainingTime
            ) || 0;


          setTime(
            remainingTime
          );


          timeRef.current =
            remainingTime;


          /*
            نحفظ النسخة المسترجعة مرة أخرى
            ولكن بعد انتهاء عملية الاسترجاع.
          */

          saveLocalBackup(
            finalAnswers,
            remainingTime,
            "paused",
            currentRef.current
          );

        }


        // ==================================================
        // In Progress
        // ==================================================

        else if (
          serverAttempt.status ===
          "in_progress"
        ) {

          // ==================================================
          // Server expiresAt
          // ==================================================

          if (
            serverAttempt.expiresAt
          ) {

            const remainingFromServer =
              Math.max(
                0,
                Math.ceil(
                  (
                    new Date(
                      serverAttempt.expiresAt
                    ).getTime() -
                    Date.now()
                  ) / 1000
                )
              );


            /*
              لو Local Backup أحدث من السيرفر
              لا نسمح أبدًا بزيادة الوقت.

              نأخذ الأقل بين الاثنين.
            */

            if (
              localIsNewer &&
              localBackup &&
              Number.isFinite(
                Number(
                  localBackup.remainingTime
                )
              )
            ) {

              remainingTime =
                Math.min(
                  remainingFromServer,
                  Number(
                    localBackup.remainingTime
                  )
                );

            } else {

              remainingTime =
                remainingFromServer;

            }

          }


          setTime(
            remainingTime
          );


          timeRef.current =
            remainingTime;


          /*
            مهم:
            نحفظ الـBackup بعد الاسترجاع
            حتى يصبح عندنا نسخة مؤكدة.
          */

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

            setExamLocked(
              true
            );

            examLockedRef.current =
              true;


            setTimeout(
              () => {

                submitExam(
                  true
                );

              },
              100
            );

          }

        }


      } catch (error) {

        console.log(
          "LOAD ATTEMPT ERROR:",
          error
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // ==================================================
  // Select Answer
  // ==================================================

  const selectAnswer =
    (
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


      setAnswers(
        prev => {

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

              [question._id]:
                [value],

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
              old.includes(
                value
              )
            ) {

              updated = {

                ...prev,

                [question._id]:
                  old.filter(
                    x =>
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

          }


          else {

            updated =
              prev;

          }


          answersRef.current =
            updated;


          // ==================================================
          // SAVE LOCAL IMMEDIATELY
          // ==================================================

          saveLocalBackup(
            updated,
            timeRef.current,
            "in_progress",
            currentRef.current
          );


          return updated;

        }
      );

    };


  // ==================================================
  // Essay
  // ==================================================

  const handleEssayAnswer =
    (
      questionId,
      value
    ) => {

      if (
        examLockedRef.current ||
        isPausedRef.current
      ) {

        return;

      }


      setAnswers(
        prev => {

          const updated = {

            ...prev,

            [questionId]: {

              essayAnswer:
                value,

            },

          };


          answersRef.current =
            updated;


          // ==================================================
          // SAVE LOCAL IMMEDIATELY
          // ==================================================

          saveLocalBackup(
            updated,
            timeRef.current,
            "in_progress",
            currentRef.current
          );


          return updated;

        }
      );

    };


  // ==================================================
  // Navigation With Local Save
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


        /*
          نحفظ رقم السؤال الحالي
          حتى بعد Refresh يرجع الطالب
          لنفس السؤال.
        */

        saveLocalBackup(
          answersRef.current,
          timeRef.current,
          "in_progress",
          safeIndex
        );

      },
      [
        questions.length,
        saveLocalBackup
      ]
    );


  // ==================================================
  // Format Answers
  // ==================================================

  const getFormattedAnswers =
    useCallback(
      () => {

        const currentAnswers =
          answersRef.current || {};


        return Object.keys(
          currentAnswers
        ).map(
          id => {

            const value =
              currentAnswers[id];


            // ==================================================
            // Essay
            // ==================================================

            if (
              value &&
              typeof value ===
                "object" &&
              value.essayAnswer !==
                undefined
            ) {

              return {

                questionId:
                  id,

                essayAnswer:
                  value.essayAnswer ||
                  "",

              };

            }


            // ==================================================
            // Other
            // ==================================================

            return {

              questionId:
                id,

              selectedAnswers:
                Array.isArray(
                  value
                )
                  ? value
                  : value !==
                      undefined
                    ? [value]
                    : [],

            };

          }
        );

      },
      []
    );


  // ==================================================
  // Save Answers
  // ==================================================

  const saveAnswers =
    useCallback(
      async (
        force = false
      ) => {

        const currentAttempt =
          attemptRef.current;


        if (
          !currentAttempt
        ) {

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


        const formattedAnswers =
          getFormattedAnswers();


        const remainingTime =
          Math.max(
            0,
            Math.floor(
              Number(
                timeRef.current
              ) || 0
            )
          );


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


          /*
            حتى لو السيرفر فشل،
            الإجابات موجودة محليًا.
          */

          return false;

        }

      },
      [
        getFormattedAnswers,
        saveLocalBackup
      ]
    );


  // ==================================================
  // Pause Exam
  // ==================================================

  const pauseExam =
    useCallback(
      async (
        silent = false
      ) => {

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


        const remainingTime =
          Math.max(
            0,
            Math.floor(
              Number(
                timeRef.current
              ) || 0
            )
          );


        const currentAnswers =
          getFormattedAnswers();


        // ==================================================
        // Local Backup First
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

        setIsPaused(
          true
        );


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

            status:
              "paused",

            remainingTime,

            expiresAt:
              null,

            pausedAt:
              new Date().toISOString(),

          };


          setAttempt(
            attemptRef.current
          );


          if (
            !silent
          ) {

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


          /*
            Local Backup موجود بالفعل،
            لذلك لو السيرفر فشل لا نضيع الإجابات.
          */

          isPausedRef.current =
            false;

          setIsPaused(
            false
          );


          startTimer();


          return false;

        } finally {

          pausingRef.current =
            false;

        }

      },
      [
        getFormattedAnswers,
        saveLocalBackup
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


          if (
            !data.success
          ) {

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


            setIsPaused(
              false
            );

            setExamLocked(
              true
            );

            setTime(
              0
            );


            timeRef.current =
              0;


            clearLocalBackup(
              currentAttempt._id
            );


            alert(
              "انتهى وقت الامتحان وتم تسليمه تلقائيًا"
            );


            navigate(
              `/exam-result/${examId}`,
              {
                replace: true
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


          const remaining =
            Math.max(
              0,
              Math.floor(
                Number(
                  updatedAttempt.remainingTime
                ) || 0
              )
            );


          timeRef.current =
            remaining;


          setTime(
            remaining
          );


          isPausedRef.current =
            false;


          setIsPaused(
            false
          );


          examLockedRef.current =
            false;


          setExamLocked(
            false
          );


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
        saveLocalBackup
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

        if (
          !customAttempt
        ) {

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


        const tick =
          () => {

            if (
              isPausedRef.current ||
              examLockedRef.current ||
              submittingRef.current
            ) {

              return;

            }


            let currentTime =
              Number(
                timeRef.current
              );


            if (
              !Number.isFinite(
                currentTime
              )
            ) {

              currentTime =
                0;

            }


            currentTime =
              Math.max(
                0,
                currentTime - 1
              );


            timeRef.current =
              currentTime;


            setTime(
              currentTime
            );


            // ==================================================
            // Local Backup Every Second
            // ==================================================

            saveLocalBackup(
              answersRef.current,
              currentTime,
              "in_progress",
              currentRef.current
            );


            // ==================================================
            // Time Ended
            // ==================================================

            if (
              currentTime <= 0
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


              setExamLocked(
                true
              );


              submitExam(
                true
              );

            }

          };


        timerRef.current =
          setInterval(
            tick,
            1000
          );

      },
      [
        saveLocalBackup
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
      "in_progress"
    ) {

      if (
        !isPaused
      ) {

        startTimer(
          attempt
        );

      }

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
    startTimer
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
    saveAnswers
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
    saveAnswers
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

            const remainingTime =
              Math.max(
                0,
                Math.floor(
                  Number(
                    timeRef.current
                  ) || 0
                )
              );


            // ==================================================
            // LOCAL FIRST
            // ==================================================

            saveLocalBackup(
              answersRef.current,
              remainingTime,
              "paused",
              currentRef.current
            );


            // ==================================================
            // Pause Server
            // ==================================================

            pauseExam(
              true
            );

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

            setIsPaused(
              true
            );

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
    saveLocalBackup
  ]);


  // ==================================================
  // Before Unload
  // ==================================================

  useEffect(() => {

    const handleBeforeUnload = () => {

      if (
        !attemptRef.current ||
        submittingRef.current ||
        examLockedRef.current
      ) {
        return;
      }

      const remainingTime =
        Math.max(
          0,
          Math.floor(
            Number(
              timeRef.current
            ) || 0
          )
        );

      const formattedAnswers =
        getFormattedAnswers();

      // ==========================================
      // LOCAL BACKUP
      // ==========================================

      saveLocalBackup(
        answersRef.current,
        remainingTime,
        "paused",
        currentRef.current
      );

      // ==========================================
      // SERVER BACKUP
      // ==========================================

      const token =
        localStorage.getItem("token");

      const apiUrl =
        import.meta.env.VITE_API_URL;

      if (!token || !apiUrl) {
        return;
      }

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
    saveLocalBackup
  ]);

  // ==================================================
  // Submit Exam
  // ==================================================

  const submitExam =
    async (
      autoSubmit = false
    ) => {

      if (
        !attemptRef.current ||
        submittingRef.current
      ) {

        return;

      }


      submittingRef.current =
        true;


      try {

        const formattedAnswers =
          getFormattedAnswers();


        const currentTime =
          Math.max(
            0,
            Math.floor(
              Number(
                timeRef.current
              ) || 0
            )
          );


        // ==================================================
        // Auto Submit
        // ==================================================

        if (
          autoSubmit
        ) {

          setExamLocked(
            true
          );

          examLockedRef.current =
            true;


          setTime(
            0
          );

          timeRef.current =
            0;

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


        if (
          data.success
        ) {

          clearLocalBackup(
            attemptRef.current._id
          );


          navigate(
            `/exam-result/${examId}`,
            {
              replace: true
            }
          );


        } else {

          submittingRef.current =
            false;


          examLockedRef.current =
            false;


          setExamLocked(
            false
          );


          alert(
            data.message ||
            "حدث خطأ أثناء تسليم الامتحان"
          );

        }


      } catch (error) {

        console.log(
          "SUBMIT ERROR:",
          error.response?.data ||
            error
        );


        submittingRef.current =
          false;


        /*
          لو Auto Submit فشل،
          لا نحذف الـLocal Backup.
        */

        if (
          !autoSubmit
        ) {

          examLockedRef.current =
            false;


          setExamLocked(
            false
          );

        }

      }

    };


  // ==================================================
  // Format Time
  // ==================================================

  const formatTime =
    () => {

      const safeTime =
        Number(
          time
        );


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

  if (
    loading
  ) {

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


  if (
    !q
  ) {

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
            maxWidth:
              "600px",

            margin:
              "0 auto",

            textAlign:
              "center",

            padding:
              "40px",

          }}
        >

          <div
            style={{
              fontSize:
                "48px",

              marginBottom:
                "20px",

            }}
          >

            ⏸️

          </div>


          <h2>
            الامتحان متوقف مؤقتًا
          </h2>


          <p
            style={{
              marginTop:
                "12px",

              marginBottom:
                "25px",

            }}
          >

            تم حفظ إجاباتك
            <br />

            والوقت متوقف

          </p>


          <div
            style={{
              fontSize:
                "24px",

              fontWeight:
                "bold",

              marginBottom:
                "25px",

            }}
          >

            <FiClock />

            {" "}

            {formatTime()}

          </div>


          <button
            type="button"
            onClick={
              resumeExam
            }
            style={{
              display:
                "inline-flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap:
                "8px",

              padding:
                "14px 28px",

              border:
                "none",

              borderRadius:
                "10px",

              cursor:
                "pointer",

              fontSize:
                "16px",

              fontWeight:
                "600",

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

          {q.type ===
          "essay" ? (

            <textarea

              className="essay-answer"

              rows={8}

              placeholder=
                "اكتب إجابتك هنا..."

              value={
                answers[
                  q._id
                ]?.essayAnswer ||
                ""
              }

              onChange={
                e =>
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

                  key={
                    index
                  }

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
              submitExam(
                false
              )
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
            setPreviewImage(
              null
            )
          }

        >

          <img

            src={
              previewImage
            }

            alt=""

            className=
              "image-modal-content"

          />

        </div>

      )}

    </div>

  );

}