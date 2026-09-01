import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios.js";

import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiX,
  FiCheck,
  FiImage
} from "react-icons/fi";

import "./ExamQuestions.css";

export default function ExamQuestions() {
  const { examId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const emptyQuestion = {
    type: "mcq",
    question: "",
    image: null,
    options: [
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" }
    ],
    correctAnswers: [],
    marks: 1,
    explanation: ""
  };

  const [question, setQuestion] = useState(emptyQuestion);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data } = await api.get(
        `/questions/exam/${examId}`
      );

      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.log(
        "LOAD QUESTIONS ERROR:",
        error.response?.data || error.message
      );
    }

    setLoading(false);
  };

  const handleQuestionChange = (e) => {
    setQuestion({
      ...question,
      [e.target.name]: e.target.value
    });
  };

  // ==========================================
  // Upload Question Image
  // ==========================================

  const uploadImage = async (file) => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post(
        "/upload",
        formData
      );

      console.log("UPLOAD RESPONSE:", data);

      if (data.success) {
        setQuestion((prev) => ({
          ...prev,
          image: data.image
        }));

        console.log(
          "IMAGE URL:",
          data.image
        );
      } else {
        alert(
          data.message ||
          "فشل رفع الصورة"
        );

        setImagePreview("");
      }
    } catch (error) {
      console.log(
        "IMAGE UPLOAD ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "فشل رفع الصورة"
      );

      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // Change Question Type
  // ==========================================

  const changeQuestionType = (type) => {
    let newOptions = [];

    if (type === "trueFalse") {
      newOptions = [
        { text: "صح" },
        { text: "خطأ" }
      ];
    } else if (
      type === "mcq" ||
      type === "checkbox"
    ) {
      newOptions = [
        { text: "" },
        { text: "" },
        { text: "" },
        { text: "" }
      ];
    }

    setQuestion({
      ...question,
      type,
      options: newOptions,
      correctAnswers: []
    });
  };

  // ==========================================
  // Change Option
  // ==========================================

  const changeOption = (index, value) => {
    const newOptions = [...question.options];

    newOptions[index].text = value;

    setQuestion({
      ...question,
      options: newOptions
    });
  };

  // ==========================================
  // Add Option
  // ==========================================

  const addOption = () => {
    if (question.options.length >= 8) {
      alert(
        "يمكن إضافة 8 اختيارات كحد أقصى"
      );
      return;
    }

    setQuestion({
      ...question,
      options: [
        ...question.options,
        { text: "" }
      ]
    });
  };

  // ==========================================
  // Remove Option
  // ==========================================

  const removeOption = (index) => {
    if (question.options.length <= 2) {
      return;
    }

    const newOptions =
      question.options.filter(
        (_, i) => i !== index
      );

    const newCorrectAnswers =
      question.correctAnswers
        .filter((i) => i !== index)
        .map((i) =>
          i > index ? i - 1 : i
        );

    setQuestion({
      ...question,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };

  // ==========================================
  // Select Correct Answer
  // ==========================================

  const selectCorrect = (index) => {
    // MCQ و True/False = إجابة واحدة فقط
    if (
      question.type === "mcq" ||
      question.type === "trueFalse"
    ) {
      setQuestion({
        ...question,
        correctAnswers: [index]
      });

      return;
    }

    // Checkbox = أكثر من إجابة
    let answers = [
      ...question.correctAnswers
    ];

    if (answers.includes(index)) {
      answers = answers.filter(
        (item) => item !== index
      );
    } else {
      answers.push(index);
    }

    setQuestion({
      ...question,
      correctAnswers: answers
    });
  };

  // ==========================================
  // Create Question
  // ==========================================

  const createQuestion = async () => {
    console.log("QUESTION DATA:", {
      ...question,
      examId
    });

    // ======================================
    // Validation
    // ======================================

    if (!question.question.trim()) {
      alert("اكتب نص السؤال");
      return;
    }

    if (Number(question.marks) < 1) {
      alert(
        "درجة السؤال يجب أن تكون أكبر من صفر"
      );
      return;
    }

    if (
      question.type !== "essay" &&
      question.correctAnswers.length === 0
    ) {
      alert("حدد الإجابة الصحيحة");
      return;
    }

    if (
      question.type === "mcq" ||
      question.type === "checkbox"
    ) {
      const hasEmptyOption =
        question.options.some(
          (option) =>
            !option.text.trim()
        );

      if (hasEmptyOption) {
        alert("اكتب جميع الاختيارات");
        return;
      }
    }

    if (question.type === "trueFalse") {
      if (
        question.correctAnswers.length !== 1
      ) {
        alert("حدد إجابة صحيحة واحدة");
        return;
      }
    }

    // ======================================
    // FormData
    // ======================================

    const formData = new FormData();

    formData.append(
      "examId",
      examId
    );

    formData.append(
      "type",
      question.type
    );

    formData.append(
      "question",
      question.question
    );

    formData.append(
      "marks",
      question.marks
    );

    formData.append(
      "explanation",
      question.explanation
    );

    formData.append(
      "options",
      JSON.stringify(question.options)
    );

    formData.append(
      "correctAnswers",
      JSON.stringify(
        question.correctAnswers
      )
    );

    // Cloudinary URL
    if (question.image) {
      formData.append(
        "image",
        question.image
      );
    }

    // ======================================
    // Create
    // ======================================

    try {
      const { data } = await api.post(
        "/questions",
        formData
      );

      console.log(
        "SERVER RESPONSE:",
        data
      );

      if (data.success) {
        setQuestions((prev) => [
          ...prev,
          data.question
        ]);

        setQuestion({
          type: "mcq",
          question: "",
          image: null,
          options: [
            { text: "" },
            { text: "" },
            { text: "" },
            { text: "" }
          ],
          correctAnswers: [],
          marks: 1,
          explanation: ""
        });

        setImagePreview("");
        setShowForm(false);
      }
    } catch (error) {
      console.log(
        "CREATE QUESTION ERROR:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
        "حدث خطأ أثناء حفظ السؤال"
      );
    }
  };

  // ==========================================
  // Delete Question
  // ==========================================

  const deleteQuestion = async (id) => {
    if (
      !window.confirm("حذف السؤال؟")
    ) {
      return;
    }

    try {
      const { data } =
        await api.delete(
          `/questions/${id}`
        );

      if (data.success) {
        setQuestions(
          questions.filter(
            (q) => q._id !== id
          )
        );
      }
    } catch (error) {
      console.log(
        "DELETE QUESTION ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  return (
    <div className="exam-questions">
      <div className="page-header">
        <div>
          <h1>
            إدارة أسئلة الامتحان
          </h1>

          <p>
            قم بإنشاء وإدارة أسئلة الامتحان
          </p>
        </div>

        <button
          className="add-question"
          onClick={() =>
            setShowForm(true)
          }
        >
          <FiPlus />
          إضافة سؤال
        </button>
      </div>

      {showForm && (
        <div className="question-builder">
          <div className="builder-header">
            <h2>
              إنشاء سؤال جديد
            </h2>

            <button
              onClick={() =>
                setShowForm(false)
              }
            >
              <FiX />
            </button>
          </div>

          <select
            name="type"
            value={question.type}
            onChange={(e) =>
              changeQuestionType(
                e.target.value
              )
            }
          >
            <option value="mcq">
              اختيار من متعدد
            </option>

            <option value="trueFalse">
              صح وخطأ
            </option>

            <option value="checkbox">
              اختيارات متعددة
            </option>

            <option value="essay">
              سؤال مقالي
            </option>
          </select>

          <textarea
            name="question"
            placeholder="اكتب نص السؤال..."
            value={question.question}
            onChange={handleQuestionChange}
          />

          <div className="image-upload">
            <label>
              <FiImage />
              إضافة صورة للسؤال
            </label>

            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={async (e) => {
                const file =
                  e.target.files[0];

                if (!file) return;

                setImagePreview(
                  URL.createObjectURL(file)
                );

                // =====================================
                // IMPORTANT:
                // إرسال file وليس event
                // =====================================

                await uploadImage(file);
              }}
            />

            {uploading && (
              <p>
                جاري رفع الصورة...
              </p>
            )}
          </div>

          {imagePreview && (
            <div className="preview-image">
              <img
                src={imagePreview}
                alt="preview"
              />
            </div>
          )}

          <div className="marks-box">
            <label>
              درجة السؤال
            </label>

            <input
              type="number"
              name="marks"
              value={question.marks}
              onChange={
                handleQuestionChange
              }
            />
          </div>

          {(question.type === "mcq" ||
            question.type === "checkbox" ||
            question.type === "trueFalse") && (
            <div className="options-builder">
              <h3>
                الاختيارات
              </h3>

              {question.options.map(
                (op, index) => (
                  <div
                    className="option-row"
                    key={index}
                  >
                    <button
                      className={
                        question.correctAnswers.includes(
                          index
                        )
                          ? "correct-btn active"
                          : "correct-btn"
                      }
                      onClick={() =>
                        selectCorrect(
                          index
                        )
                      }
                    >
                      <FiCheck />
                    </button>

                    <input
                      value={op.text}
                      placeholder={`الاختيار ${
                        index + 1
                      }`}
                      onChange={(e) =>
                        changeOption(
                          index,
                          e.target.value
                        )
                      }
                    />

                    {question.type !==
                      "trueFalse" && (
                      <button
                        className="delete-option"
                        onClick={() =>
                          removeOption(
                            index
                          )
                        }
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                )
              )}

              {question.type !==
                "trueFalse" && (
                <button
                  className="add-option"
                  onClick={addOption}
                >
                  + إضافة اختيار
                </button>
              )}
            </div>
          )}

          <textarea
            name="explanation"
            placeholder="شرح الإجابة (اختياري)"
            value={
              question.explanation
            }
            onChange={
              handleQuestionChange
            }
          />

          <button
            className="save-question"
            onClick={createQuestion}
            disabled={uploading}
          >
            <FiSave />

            {uploading
              ? "جاري رفع الصورة..."
              : "حفظ السؤال"}
          </button>
        </div>
      )}

      <div className="questions-list">
        {loading ? (
          <h3>
            جاري التحميل...
          </h3>
        ) : questions.length === 0 ? (
          <h3>
            لا توجد أسئلة بعد
          </h3>
        ) : (
          questions.map((q, index) => (
            <div
              className="question-card"
              key={q._id}
            >
              <div className="card-top">
                <h3>
                  السؤال {index + 1}
                </h3>

                <span>
                  {q.type}
                </span>
              </div>

              <p className="question-text">
                {q.question}
              </p>

              {q.image && (
                <img
                  src={q.image}
                  alt="question"
                  className="saved-question-image"
                />
              )}

              {q.options?.length > 0 && (
                <div className="saved-options">
                  {q.options.map(
                    (op, i) => (
                      <div
                        key={i}
                        className={
                          q.correctAnswers.includes(
                            i
                          )
                            ? "answer correct"
                            : "answer"
                        }
                      >
                        {q.correctAnswers.includes(
                          i
                        ) && (
                          <FiCheck />
                        )}

                        {op.text}
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="card-footer">
                <span>
                  الدرجة : {q.marks}
                </span>

                <button
                  onClick={() =>
                    deleteQuestion(
                      q._id
                    )
                  }
                >
                  <FiTrash2 />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}