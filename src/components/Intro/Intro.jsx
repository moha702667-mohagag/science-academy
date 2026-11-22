
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

import officialLogo from "../../assets/Precision Logo with Dynamic Atom Icon.jpg";
import teacherImage from "../../assets/Teacher2.png";

import "./Intro.css";

const SESSION_KEY = "mr-hagag-cinematic-intro-seen";
const AUDIO_SRC = "/audio/mr-hagag-intro.mp3";

export default function Intro() {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);
  const audioRef = useRef(null);

  const startedRef = useRef(false);
  const finishingRef = useRef(false);

  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "true";
    } catch {
      return true;
    }
  });

  const [started, setStarted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [progress, setProgress] = useState(0);

  // --------------------------------------------------
  // FINISH INTRO
  // --------------------------------------------------

  const finishIntro = useCallback(() => {
    if (finishingRef.current) return;

    finishingRef.current = true;

    // Stop animation.
    timelineRef.current?.pause();

    // Stop audio.
    const audio = audioRef.current;

    if (audio) {
      audio.pause();

      try {
        audio.currentTime = 0;
      } catch {
        // Audio may not be ready.
      }
    }

    // Save session.
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Storage may be unavailable.
    }

    const root = rootRef.current;

    if (!root) {
      setVisible(false);
      return;
    }

    gsap.to(root, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setVisible(false);
      },
    });
  }, []);

  // --------------------------------------------------
  // START INTRO
  // --------------------------------------------------

  const startIntro = useCallback(async () => {
    if (startedRef.current || finishingRef.current) return;

    const audio = audioRef.current;
    const timeline = timelineRef.current;

    if (!audio || !timeline) return;

    try {
      audio.currentTime = 0;

      // Start audio after user interaction.
      await audio.play();

      if (finishingRef.current) {
        audio.pause();
        return;
      }

      startedRef.current = true;

      setStarted(true);
      setAudioError(false);

      // Match GSAP duration with audio duration.
      const audioDuration = audio.duration;
      const animationDuration = timeline.duration();

      if (
        Number.isFinite(audioDuration) &&
        audioDuration > 0 &&
        animationDuration > 0
      ) {
        timeline.timeScale(
          animationDuration / audioDuration
        );
      }

      // Start visual timeline.
      timeline.play(0);

    } catch (error) {
      console.error("MR.HAGAG Intro Audio Error:", error);

      setAudioError(true);
    }
  }, []);

  // --------------------------------------------------
  // GSAP ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (!visible || !rootRef.current) return;

    const root = rootRef.current;

    document.body.classList.add("intro-is-active");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const context = gsap.context(() => {

      // --------------------------------------------------
      // REDUCED MOTION
      // --------------------------------------------------

      if (reducedMotion) {
        gsap.set(".film-scene", {
          autoAlpha: 0,
        });

        gsap.set(".scene-final", {
          autoAlpha: 1,
        });

        gsap.set(".final-scene", {
          scale: 1,
        });

        gsap.set(
          [
            ".final-logo",
            ".final-copy",
            ".final-teacher",
          ],
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
          }
        );

        gsap.set(".final-divider", {
          scaleX: 1,
        });

        gsap.set(".light-burst", {
          scale: 1,
          opacity: 0.2,
        });

        return;
      }

      const progressState = {
        value: 0,
      };

      // --------------------------------------------------
      // INITIAL STATES
      // --------------------------------------------------

      gsap.set(".film-scene", {
        autoAlpha: 0,
      });

      gsap.set(".scene-dna", {
        autoAlpha: 1,
      });

      gsap.set(".scene-copy", {
        autoAlpha: 0,
        y: 25,
      });

      gsap.set(".dna-world", {
        scale: 0.72,
        rotation: -8,
      });

      gsap.set(".dna-rung", {
        scaleX: 0,
        transformOrigin: "center",
      });

      gsap.set(".atom-world", {
        scale: 0.55,
        rotation: -25,
      });

      gsap.set(".atom-electron", {
        scale: 0,
        opacity: 0,
      });

      gsap.set(".planet", {
        scale: 0,
        opacity: 0,
      });

      gsap.set(".element-tile", {
        y: 35,
        opacity: 0,
        scale: 0.85,
      });

      gsap.set(".final-logo", {
        y: 30,
        scale: 0.9,
        autoAlpha: 0,
      });

      gsap.set(".final-copy", {
        y: 20,
        autoAlpha: 0,
      });

      gsap.set(".final-teacher", {
        y: 30,
        scale: 0.9,
        autoAlpha: 0,
      });

      gsap.set(".final-divider", {
        scaleX: 0,
        transformOrigin: "center",
      });

      gsap.set(".light-burst", {
        scale: 0,
        opacity: 0,
      });

      // --------------------------------------------------
      // MAIN TIMELINE
      // --------------------------------------------------

      const tl = gsap.timeline({
        paused: true,

        onUpdate: () => {
          setProgress(
            Math.min(
              100,
              Math.round(progressState.value)
            )
          );
        },

        onComplete: () => {
          setProgress(100);
        },
      });

      timelineRef.current = tl;

      // Overall progress.
      tl.to(
        progressState,
        {
          value: 100,
          duration: 17,
          ease: "none",
        },
        0
      );

      // ==================================================
      // SCENE 01 — THE BEGINNING / DNA
      // ==================================================

      tl.to(
        ".scene-copy-dna",
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
        },
        0.5
      );

      tl.to(
        ".dna-world",
        {
          scale: 1,
          rotation: 0,
          duration: 2.2,
          ease: "power3.out",
        },
        0.6
      );

      tl.to(
        ".dna-rung",
        {
          scaleX: 1,
          duration: 1.1,
          stagger: 0.055,
          ease: "power2.out",
        },
        1.1
      );

      tl.to(
        ".dna-glow",
        {
          opacity: 1,
          scale: 1.3,
          duration: 2,
        },
        1.3
      );

      tl.to(
        ".dna-world",
        {
          scale: 1.15,
          rotation: 4,
          duration: 2,
          ease: "sine.inOut",
        },
        2.2
      );

      tl.to(
        ".scene-copy-dna",
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.6,
        },
        3.1
      );

      // DNA transition.
      tl.to(
        ".dna-world",
        {
          scale: 1.8,
          rotation: 25,
          opacity: 0,
          filter: "blur(18px)",
          duration: 1.1,
          ease: "power2.in",
        },
        3.5
      );

      // ==================================================
      // SCENE 02 — THE ATOM
      // ==================================================

      tl.to(
        ".scene-atom",
        {
          autoAlpha: 1,
          duration: 0.7,
        },
        3.9
      );

      tl.to(
        ".atom-world",
        {
          scale: 1,
          rotation: 0,
          duration: 1.3,
          ease: "back.out(1.4)",
        },
        4.0
      );

      tl.to(
        ".atom-electron",
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
        },
        4.7
      );

      tl.to(
        ".atom-core",
        {
          scale: 1.18,
          duration: 0.8,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        5.0
      );

      tl.to(
        ".scene-copy-atom",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
        },
        5.1
      );

      tl.to(
        ".atom-world",
        {
          scale: 1.28,
          rotation: 14,
          duration: 1.4,
          ease: "power2.in",
        },
        6.1
      );

      tl.to(
        ".scene-copy-atom",
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.45,
        },
        6.35
      );

      tl.to(
        ".atom-world",
        {
          scale: 2.2,
          opacity: 0,
          filter: "blur(16px)",
          duration: 0.9,
        },
        6.5
      );

      // ==================================================
      // SCENE 03 — THE UNIVERSE
      // ==================================================

      tl.to(
        ".scene-space",
        {
          autoAlpha: 1,
          duration: 0.7,
        },
        6.75
      );

      tl.to(
        ".space-world",
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
        },
        6.8
      );

      tl.to(
        ".planet",
        {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          stagger: 0.2,
          ease: "back.out(1.5)",
        },
        7.2
      );

      tl.to(
        ".sun-core",
        {
          scale: 1.12,
          duration: 1.2,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        7.7
      );

      tl.to(
        ".scene-copy-space",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
        },
        8.0
      );

      tl.to(
        ".space-world",
        {
          scale: 1.22,
          duration: 2,
          ease: "sine.inOut",
        },
        8.5
      );

      tl.to(
        ".scene-copy-space",
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.5,
        },
        9.5
      );

      tl.to(
        ".space-world",
        {
          scale: 1.7,
          opacity: 0,
          filter: "blur(16px)",
          duration: 0.8,
        },
        9.7
      );

      // ==================================================
      // SCENE 04 — ELEMENTS
      // ==================================================

      tl.to(
        ".scene-elements",
        {
          autoAlpha: 1,
          duration: 0.6,
        },
        9.9
      );

      tl.to(
        ".elements-world",
        {
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        10
      );

      tl.to(
        ".element-tile",
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          stagger: {
            each: 0.075,
            from: "random",
          },
          ease: "power3.out",
        },
        10.2
      );

      tl.to(
        ".scene-copy-elements",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        10.65
      );

      tl.to(
        ".elements-world",
        {
          scale: 1.1,
          duration: 1.5,
          ease: "sine.inOut",
        },
        11.3
      );

      tl.to(
        ".scene-copy-elements",
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.5,
        },
        12.1
      );

      tl.to(
        ".elements-world",
        {
          scale: 1.8,
          opacity: 0,
          filter: "blur(18px)",
          duration: 0.8,
        },
        12.3
      );

      // ==================================================
      // SCENE 05 — BRAND REVEAL
      // ==================================================

      tl.to(
        ".scene-final",
        {
          autoAlpha: 1,
          duration: 0.8,
        },
        12.5
      );

      tl.to(
        ".light-burst",
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: "power2.out",
        },
        12.8
      );

      tl.to(
        ".light-burst",
        {
          opacity: 0.15,
          scale: 1.6,
          duration: 1.2,
        },
        13.6
      );

      tl.to(
        ".final-logo",
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 1.2,
          ease: "power3.out",
        },
        13.55
      );

      tl.to(
        ".final-divider",
        {
          scaleX: 1,
          duration: 0.7,
        },
        14.45
      );

      tl.to(
        ".final-copy",
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.16,
        },
        14.7
      );

      tl.to(
        ".final-scene",
        {
          scale: 1.025,
          duration: 1.5,
          ease: "sine.inOut",
        },
        15.3
      );

      tl.to(
        ".final-teacher",
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 1.3,
          ease: "power3.out",
        },
        13.7
      );

    }, root);

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;

      context.revert();

      document.body.classList.remove("intro-is-active");
    };

  }, [visible]);

  // --------------------------------------------------
  // AUDIO CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
      }
    };
  }, []);

  if (!visible) return null;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="cinema-intro" ref={rootRef}>

      {/* AUDIO */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        onEnded={finishIntro}
        onError={() => setAudioError(true)}
      />

      {/* START SCREEN */}
      {!started && (
        <div className="intro-start-overlay">

          <button
            className="intro-start-button"
            onClick={startIntro}
            type="button"
            disabled={audioError}
          >
            <span className="intro-start-icon">
              ▶
            </span>

            <span>
              ابدأ رحلة الاكتشاف
            </span>
          </button>

          {audioError && (
            <p className="intro-audio-error">
              تعذر تحميل الصوت. تأكد من وجود الملف وحاول تحديث الصفحة.
            </p>
          )}

        </div>
      )}

      {/* BACKGROUND */}
      <div className="cinema-background">
        <div className="cinema-stars" />
        <div className="cinema-vignette" />
        <div className="cinema-grain" />
        <div className="cinema-blue-glow" />
      </div>

      {/* TOP BAR */}
      <div className="cinema-topbar">
        <span className="cinema-brand-mark">
          MR.HAGAG
        </span>

        <span className="cinema-top-caption">
          رحلة اكتشاف العلم
        </span>
      </div>

      {/* SKIP */}
      {started && (
        <button
          className="cinema-skip"
          type="button"
          onClick={finishIntro}
        >
          تخطي المقدمة <span>↗</span>
        </button>
      )}

      {/* MAIN STAGE */}
      <main className="cinema-stage">

        {/* =========================================
            SCENE 01 — DNA
        ========================================= */}

        <section className="film-scene scene-dna">

          <div className="scene-atmosphere dna-atmosphere" />

          <div className="dna-glow" />

          <div className="scene-copy scene-copy-dna">
            <span className="scene-eyebrow">
              رحلة تبدأ بسؤال
            </span>

            <h1>
              كل شيء حولنا... له حكاية
            </h1>

            <p>
              وهنا تبدأ رحلة اكتشاف أسرار الحياة
            </p>
          </div>

          <div className="dna-world">

            <div className="dna-helix">

              {Array.from({ length: 19 }).map((_, i) => (
                <div className="dna-rung" key={i}>
                  <span className="dna-bead dna-bead-left" />
                  <span className="dna-bridge" />
                  <span className="dna-bead dna-bead-right" />
                </div>
              ))}

            </div>

          </div>

        </section>

        {/* =========================================
            SCENE 02 — ATOM
        ========================================= */}

        <section className="film-scene scene-atom">

          <div className="scene-atmosphere atom-atmosphere" />

          <div className="atom-world">

            <div className="atom-core" />

            <div className="atom-orbit atom-orbit-a">
              <i className="atom-electron" />
            </div>

            <div className="atom-orbit atom-orbit-b">
              <i className="atom-electron" />
            </div>

            <div className="atom-orbit atom-orbit-c">
              <i className="atom-electron" />
            </div>

          </div>

          <div className="scene-copy scene-copy-atom">

            <span className="scene-eyebrow">
              أسرار لا تُرى بالعين
            </span>

            <h2>
              من أصغر ذرة...
            </h2>

            <p>
              تبدأ حكايات عالم كامل من حولنا
            </p>

          </div>

        </section>

        {/* =========================================
            SCENE 03 — UNIVERSE
        ========================================= */}

        <section className="film-scene scene-space">

          <div className="space-nebula" />

          <div className="scene-copy scene-copy-space">

            <span className="scene-eyebrow">
              رحلة إلى ما وراء المألوف
            </span>

            <h2>
              إلى أبعد مجرة
            </h2>

            <p>
              كون واسع... وأسئلة لا تنتهي
            </p>

          </div>

          <div className="space-world">

            <div className="sun-core">
              <span />
            </div>

            <div className="solar-orbit solar-orbit-one">
              <i className="planet planet-one" />
            </div>

            <div className="solar-orbit solar-orbit-two">
              <i className="planet planet-two" />
            </div>

            <div className="solar-orbit solar-orbit-three">
              <i className="planet planet-three" />
            </div>

            <div className="solar-orbit solar-orbit-four">
              <i className="planet planet-four" />
            </div>

            <div className="solar-orbit solar-orbit-five">
              <i className="planet planet-five" />
            </div>

          </div>

        </section>

        {/* =========================================
            SCENE 04 — ELEMENTS
        ========================================= */}

        <section className="film-scene scene-elements">

          <div className="scene-copy scene-copy-elements">

            <span className="scene-eyebrow">
              لغة المادة وأسرارها
            </span>

            <h2>
              كل معلومة... مفتاح لاكتشاف جديد
            </h2>

            <p>
              نفهم العناصر، ونكتشف العالم من حولنا
            </p>

          </div>

          <div className="elements-world">

            {[
              ["H", "1", "هيدروجين"],
              ["O", "8", "أكسجين"],
              ["C", "6", "كربون"],
              ["Fe", "26", "حديد"],
              ["Na", "11", "صوديوم"],
              ["Au", "79", "ذهب"],
              ["He", "2", "هيليوم"],
              ["N", "7", "نيتروجين"],
              ["Ca", "20", "كالسيوم"],
              ["Cu", "29", "نحاس"],
              ["Ag", "47", "فضة"],
              ["Mg", "12", "ماغنسيوم"],
            ].map(([symbol, number, name]) => (

              <div className="element-tile" key={symbol}>
                <span>{number}</span>
                <strong>{symbol}</strong>
                <small>{name}</small>
              </div>

            ))}

          </div>

        </section>

        {/* =========================================
            SCENE 05 — FINAL BRAND REVEAL
        ========================================= */}

        <section className="film-scene scene-final">

          <div className="final-scene">

            <div className="light-burst" />

            <div className="final-content">

              <span className="final-overline">
                هنا تبدأ رحلة الفهم والاكتشاف
              </span>

              <div className="final-brand-lockup">

                {/* OFFICIAL ACADEMY LOGO */}

                <div className="final-logo-wrap">

                  <img
                    className="final-logo"
                    src={officialLogo}
                    alt="شعار أكاديمية مستر أحمد حجاج"
                    draggable="false"
                  />

                </div>

                {/* TEACHER PORTRAIT */}

                <div className="final-teacher-wrap">

                  <div className="teacher-light" />

                  <img
                    className="final-teacher"
                    src={teacherImage}
                    alt="مستر أحمد حجاج مدرس العلوم"
                    draggable="false"
                  />

                </div>

              </div>

              <div className="final-divider" />

              <h2 className="final-copy">
                أكاديمية مستر أحمد حجاج
              </h2>

              <p className="final-copy">
                العلم مش مجرد معلومات... العلم فهم واكتشاف
              </p>

              <span className="final-tagline final-copy">
                اتعلم • افهم • اكتشف
              </span>

            </div>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="cinema-footer">

        <div className="cinema-progress">
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="cinema-footer-info">

          <span>
            MR.HAGAG SCIENCE ACADEMY
          </span>

          <span>
            {String(progress).padStart(2, "0")}%
          </span>

        </div>

      </footer>

    </div>
  );
}
