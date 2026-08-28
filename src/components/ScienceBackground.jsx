import "./ScienceBackground.css";
import { useEffect } from "react";

export default function ScienceBackground({ variant = "default" }) {

  useEffect(() => {

  const handleMouseMove = (e) => {

    const elements = document.querySelectorAll(
      ".science-item, .science-formula, .math-symbol, .science-planet, .science-moon, .science-particle, .science-equation"
    );

    elements.forEach((element) => {

      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = centerX - e.clientX;
      const dy = centerY - e.clientY;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      // المسافة اللي يبدأ عندها العنصر في الهروب
      const maxDistance = 180;

      if (distance < maxDistance) {

        // كل ما الماوس يقرب، التأثير يزيد
        const force =
          (maxDistance - distance) / maxDistance;

        // أقصى مسافة يهربها العنصر
        const maxMove = 65;

        const moveX =
          (dx / (distance || 1)) *
          force *
          maxMove;

        const moveY =
          (dy / (distance || 1)) *
          force *
          maxMove;

        element.style.setProperty(
          "--repel-x",
          `${moveX}px`
        );

        element.style.setProperty(
          "--repel-y",
          `${moveY}px`
        );

      } else {

        element.style.setProperty(
          "--repel-x",
          "0px"
        );

        element.style.setProperty(
          "--repel-y",
          "0px"
        );

      }

    });

  };


  window.addEventListener(
    "pointermove",
    handleMouseMove
  );


  return () => {

    window.removeEventListener(
      "pointermove",
      handleMouseMove
    );

  };

}, []);


  const layouts = {
    hero: {
      items: ["⚛", " ", "🧪",  " ", " ", "🔬", " ", "🧬"],
      formulas: ["E = mc²", "F = ma", "H₂O", "PV = nRT"],
      planets: false,
    },

    features: {
      items: ["🔬", "🧬", "🧪", "⚛", "🧲", "⚗", "✧", "✦"],
      formulas: ["F = ma", "P = F / A", "V = IR", "ΔE = mc²", "λ = h / p"],
      planets: true,
    },

    classes: {
      items: ["π", "Σ", "√", "∞", "Δ", "θ", "λ"],
      formulas: ["a² + b² = c²", "v = d / t", "a = Δv / Δt"],
      planets: true,
    },

    courses: {
      items: ["🧪", "🧫", "⚗", "🧬", "⚛", "✦"],
      formulas: ["H₂O", "CO₂", "NaCl", "O₂", "PV = nRT"],
      planets: false,
    },

    exams: {
      items: ["⚛", "√", "Σ", "Δ", "🔬", "🧪","🧫"],
      formulas: ["E = mc²", "F = ma", "P = F / A", "V = IR"],
      planets: true,
    },

    contact: {
      items: ["☄", "✦", "✧", "☀", "⚛"],
      formulas: ["H₂O", "CO₂", "E = mc²"],
      planets: true,
    },

    default: {
      items: ["⚛", "🧬", "🔬", "🧪", "✦"],
      formulas: ["E = mc²", "H₂O"],
      planets: false,
    },
  };

  const layout = layouts[variant] || layouts.default;

  return (
    <div className={`science-background science-${variant}`}>

      {/* =====================================
          GLOW
      ===================================== */}

      <div className="science-glow glow-1" />
      <div className="science-glow glow-2" />
      <div className="science-glow glow-3" />


      {/* =====================================
          PLANETS
      ===================================== */}

      {layout.planets && (
        <>
          <div className="science-planet planet-1">
            <div className="planet-surface" />
          </div>

          <div className="science-planet planet-2">
            <div className="planet-ring" />
          </div>

          <div className="science-moon">
            <div className="moon-crater crater-1" />
            <div className="moon-crater crater-2" />
            <div className="moon-crater crater-3" />
          </div>
        </>
      )}


      {/* =====================================
          SCIENCE ITEMS
      ===================================== */}

      {layout.items.map((item, index) => (
        <div
          key={`item-${index}`}
          className={`science-item item-${index + 1}`}
        >
          {item}
        </div>
      ))}


      {/* =====================================
          FORMULAS
      ===================================== */}

      {layout.formulas.map((formula, index) => (
        <div
          key={`formula-${index}`}
          className={`science-formula formula-${index + 1}`}
        >
          {formula}
        </div>
      ))}


      {/* =====================================
          MATH SYMBOLS
      ===================================== */}

      {variant === "classes" && (
        <>
          <div className="math-symbol math-1">π</div>
          <div className="math-symbol math-2">Σ</div>
          <div className="math-symbol math-3">∞</div>
          <div className="math-symbol math-4">√</div>
          <div className="math-symbol math-5">∫</div>
        </>
      )}


      {/* =====================================
          PARTICLES
      ===================================== */}

      <div className="science-particle particle-1" />
      <div className="science-particle particle-2" />
      <div className="science-particle particle-3" />
      <div className="science-particle particle-4" />
      <div className="science-particle particle-5" />
      <div className="science-particle particle-6" />


      {/* =====================================
          LINES
      ===================================== */}

      <div className="science-line line-1" />
      <div className="science-line line-2" />
      <div className="science-line line-3" />

    </div>
  );
}