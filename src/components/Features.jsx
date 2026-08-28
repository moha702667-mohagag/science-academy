import "./Features.css";

import {
  FaBookOpen,
  FaClipboardCheck,
  FaLaptopCode,
  FaUsers,
  FaHeadset,
} from "react-icons/fa";

// ======================================
// FEATURES IMAGES
// ======================================

import simpleExplanation from "../assets/features/simplified-explanation.webp.png";
import comprehensiveRevision from "../assets/features/comprehensive-revision.webp.png";
import interactiveExams from "../assets/features/interactive-exams.webp.png";
import progressTracking from "../assets/features/progress-tracking.webp.png";
import technicalSupport from "../assets/features/technical-support.webp.png";


// ======================================
// FEATURES COMPONENT
// ======================================

function Features() {

  const features = [

    // ==================================
    // 1 — SIMPLE EXPLANATION
    // ==================================

    {
      title: "شرح مبسط",

      description:
        "شرح بأحدث الطرق التعليمية مع تبسيط جميع الأفكار.",

      image: simpleExplanation,

      icon: <FaBookOpen />,
    },


    // ==================================
    // 2 — COMPREHENSIVE REVISION
    // ==================================

    {
      title: "مراجعات شاملة",

      description:
        "مراجعات كاملة قبل كل امتحان لضمان الاستعداد.",

      image: comprehensiveRevision,

      icon: <FaClipboardCheck />,
    },


    // ==================================
    // 3 — INTERACTIVE EXAMS
    // ==================================

    {
      title: "امتحانات تفاعلية",

      description:
        "اختبارات وتدريبات مستمرة بعد كل درس.",

      image: interactiveExams,

      icon: <FaLaptopCode />,
    },


    // ==================================
    // 4 — PROGRESS TRACKING
    // ==================================

    {
      title: "متابعة مستمرة",

      description:
        "متابعة مع ولي الأمر لمعرفة مستوى الطالب أولًا بأول.",

      image: progressTracking,

      icon: <FaUsers />,
    },


    // ==================================
    // 5 — TECHNICAL SUPPORT
    // ==================================

    {
      title: "دعم فني",

      description:
        "الرد على جميع الاستفسارات طوال الأسبوع.",

      image: technicalSupport,

      icon: <FaHeadset />,
    },

  ];


  // ======================================
  // RENDER
  // ======================================

  return (

    <section className="features">

      {/* ==================================
          SECTION HEADER
      ================================== */}

      <div className="section-title">

        <span>
          لماذا تختارنا؟
        </span>

        <h2>
          ماذا ستحصل عند الانضمام؟
        </h2>

        <p>
          هدفنا تقديم أفضل مستوى تعليمي مع متابعة
          مستمرة حتى تحقيق أعلى النتائج.
        </p>

      </div>


      {/* ==================================
          FEATURES GRID
      ================================== */}

      <div className="features-grid">

        {features.map((feature, index) => (

          <article
            className="feature-card"
            key={index}
          >

            {/* ==================================
                IMAGE
            ================================== */}

            <div className="feature-image-wrapper">

              <img
                src={feature.image}
                alt={feature.title}
                className="feature-image"
                loading="lazy"
              />

            </div>


            {/* ==================================
                CONTENT
            ================================== */}

            <div className="feature-content">

              <div className="feature-icon">
                {feature.icon}
              </div>


              <h3>
                {feature.title}
              </h3>


              <p>
                {feature.description}
              </p>


              <div className="feature-line" />

            </div>

          </article>

        ))}

      </div>

    </section>

  );
}


export default Features;
