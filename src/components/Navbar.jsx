import "./Navbar.css";
import logo from "../assets/Precision Logo with Dynamic Atom Icon.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("redirectAfterLogin");
    navigate("/");
  };

  const handleDashboard = () => {
    if (!user) return;

    if (user.role === "teacher") {
      navigate("/teacher");
      return;
    }

    if (user.role === "student") {
      navigate(`/class/${user.grade}`);
    }
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />

        <div className="logo-text">
          <h2>Science Academy</h2>
          <span>Mr. Ahmed</span>
        </div>
      </div>

      {/* Nav Boxes */}
      <div className="nav-menu">
        <div className="nav-box" onClick={() => scrollToSection("home")}>
          الرئيسية
        </div>

        <div className="nav-box" onClick={() => scrollToSection("classes")}>
          الصفوف
        </div>

        <div className="nav-box" onClick={() => scrollToSection("testimonials")}>
          آراء الطلاب
        </div>

        <div className="nav-box" onClick={() => scrollToSection("contact")}>
          تواصل معنا
        </div>
      </div>

      {/* User Area */}
      <div className="nav-user-area">
        {user ? (
          <>
            <div className="user-welcome">
              مرحبًا، <span>{user.fullName || "المستخدم"}</span>
            </div>

            <button className="btn-dashboard" onClick={handleDashboard}>
              {user.role === "teacher" ? "لوحة المدرس" : "لوحتي"}
            </button>

            <button className="btn-logout" onClick={handleLogout}>
              تسجيل خروج
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn-login">
            سجل الآن
          </Link>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="تغيير الوضع"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;