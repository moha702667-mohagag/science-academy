import "./Hero.css";
import teacher from "../assets/Teacher2.png";

import { motion } from "framer-motion";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaFacebookF,
  FaWhatsapp,
  FaYoutube,
  FaInstagram,
  FaTelegram,
  FaAtom,
  FaFlask,
  FaMicroscope,
  FaLightbulb,
} from "react-icons/fa";

import {
  fadeLeft,
  fadeRight,
  fadeUp,
  stagger,
} from "./animations";


function Hero() {

  return (

    <motion.section
      className="hero"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >

      {/* =========================================
          HERO CONTENT
      ========================================= */}

      <motion.div
        className="hero-content"
        variants={fadeLeft}
      >

        {/* Badge */}

        <span className="hero-badge">

          <FaFlask />

          أفضل منصة لتعليم العلوم

          <FaAtom />

        </span>


        {/* Title */}

        <h1>
          مستر أحمد حجاج
        </h1>


        {/* Subtitle */}

        <h2>
          مدرس العلوم
        </h2>


        {/* Description */}

        <p>
          شرح مبسط للمرحلة الابتدائية والإعدادية،
          مع مراجعات وامتحانات وتدريب مستمر للوصول
          لأفضل النتائج.
        </p>


        {/* Buttons */}

        <div className="hero-buttons">

          <motion.button
            className="primary-btn"

            whileHover={{
              scale: 1.06,
              boxShadow:
                "0 15px 35px rgba(37,99,235,.35)"
            }}

            whileTap={{
              scale: 0.95
            }}

            onClick={() => {

              document
                .getElementById("contact")
                ?.scrollIntoView({
                  behavior: "smooth"
                });

            }}
          >

            احجز حصتك الآن

          </motion.button>


          <motion.button
            className="secondary-btn"

            whileHover={{
              scale: 1.06
            }}

            whileTap={{
              scale: 0.95
            }}

            onClick={() => {

              document
                .getElementById("features")
                ?.scrollIntoView({
                  behavior: "smooth"
                });

            }}
          >

            اعرف المزيد

          </motion.button>

        </div>


        {/* =========================================
            STATS
        ========================================= */}

        <motion.div
          className="hero-stats"
          variants={stagger}
        >

          <motion.div variants={fadeUp}>

            <FaUserGraduate className="stat-icon" />

            <h3>
              +300
            </h3>

            <span>
              طالب
            </span>

          </motion.div>


          <motion.div variants={fadeUp}>

            <FaChalkboardTeacher className="stat-icon" />

            <h3>
              +3
            </h3>

            <span>
              سنوات خبرة
            </span>

          </motion.div>


          <motion.div variants={fadeUp}>

            <FaSchool className="stat-icon" />

            <h3>
              6
            </h3>

            <span>
              صفوف دراسية
            </span>

          </motion.div>

        </motion.div>

      </motion.div>


      {/* =========================================
          TEACHER AREA
      ========================================= */}

      <motion.div
        className="hero-image"
        variants={fadeRight}
      >

        {/* =========================================
            BACKGROUND GLOW
        ========================================= */}

        <div className="teacher-glow"></div>


        {/* =========================================
            SCIENCE ORBITS
        ========================================= */}

        <div className="science-orbit orbit-1">

          <span>
            <FaAtom />
          </span>

        </div>


        <div className="science-orbit orbit-2">

          <span>
            <FaFlask />
          </span>

        </div>


        <div className="science-orbit orbit-3">

          <span>
            <FaMicroscope />
          </span>

        </div>


        {/* =========================================
            FLOATING SCIENCE ICONS
        ========================================= */}

        <motion.div
          className="science-icon atom-icon"

          animate={{
            y: [0, -12, 0],
            rotate: [0, 6, 0]
          }}

          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >

          <FaAtom />

        </motion.div>


        <motion.div
          className="science-icon flask-icon"

          animate={{
            y: [0, 12, 0],
            rotate: [0, -6, 0]
          }}

          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >

          <FaFlask />

        </motion.div>


        <motion.div
          className="science-icon microscope-icon"

          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}

          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >

          <FaMicroscope />

        </motion.div>


        <motion.div
          className="science-icon bulb-icon"

          animate={{
            y: [0, -14, 0],
            scale: [1, 1.05, 1]
          }}

          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >

          <FaLightbulb />

        </motion.div>


        {/* =========================================
            SMALL DECORATIVE DOTS
        ========================================= */}

        <span className="science-dot dot-1"></span>

        <span className="science-dot dot-2"></span>

        <span className="science-dot dot-3"></span>

        <span className="science-dot dot-4"></span>


        {/* =========================================
            TEACHER PNG
        ========================================= */}

        <motion.div
          className="teacher-cutout"

          initial={{
            opacity: 0,
            y: 45,
            scale: 0.92
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}

          transition={{
            duration: 1,
            ease: "easeOut"
          }}

          whileHover={{
            scale: 1.025
          }}
        >

          <motion.img
            src={teacher}
            alt="مستر أحمد حجاج مدرس العلوم"
            className="teacher-image"

            initial={{
              opacity: 0,
              scale: 0.94
            }}

            animate={{
              opacity: 1,
              scale: 1
            }}

            transition={{
              duration: 1.1,
              delay: 0.15,
              ease: "easeOut"
            }}
          />

        </motion.div>


        {/* =========================================
            SOCIAL ICONS
        ========================================= */}

        <motion.div
          className="social-icons"

          initial={{
            opacity: 0,
            y: 35
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay: 1,
            duration: 0.7
          }}
        >

          <a
            href="https://www.facebook.com/share/1G9XiAPPzV/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
            className="facebook"
            aria-label="Facebook"
          >

            <FaFacebookF />

          </a>


          <a
            href="https://wa.me/+201029752665"
            target="_blank"
            rel="noreferrer"
            className="whatsapp"
            aria-label="WhatsApp"
          >

            <FaWhatsapp />

          </a>


          <a
            href="https://www.instagram.com/__7a_9a9__?igsh=MXZkZTZ0d3lxcXV3"
            target="_blank"
            rel="noreferrer"
            className="instagram"
            aria-label="Instagram"
          >

            <FaInstagram />

          </a>


          <a
            href="https://www.youtube.com/@AhmedHagag-d2w"
            target="_blank"
            rel="noreferrer"
            className="youtube"
            aria-label="YouTube"
          >

            <FaYoutube />

          </a>


          <a
            href="https://t.me/MrAhmedHagag"
            target="_blank"
            rel="noreferrer"
            className="telegram"
            aria-label="Telegram"
          >

            <FaTelegram />

          </a>

        </motion.div>

      </motion.div>

    </motion.section>
  );
}


export default Hero;