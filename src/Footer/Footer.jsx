import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-content">

        <div className="footer-brand">
          <h3>MR. HAGAG Science Academy</h3>

          <p>
            منصة تعليمية متخصصة في العلوم
          </p>
        </div>


        <div className="footer-divider"></div>


        <div className="footer-copyright">

          <p>
            © {new Date().getFullYear()} MR. HAGAG Science Academy
          </p>

          <p className="developer-credit">
            Designed & Developed by
            <span> Engineer \ Mohamed Hagag </span>
          </p>

        </div>

      </div>

    </footer>
  );
}