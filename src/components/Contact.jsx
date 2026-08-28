import "./Contact.css";
import { useState } from "react";
import api from "../api/axios";

import {
  FaFacebook,
  FaWhatsapp,
  FaTelegram,
  FaInstagram,
  FaYoutube,
  FaPhone,
} from "react-icons/fa";

export default function Contact() {

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/contact", formData);

      const data = res.data;

      if (data.success) {
        alert("تم إرسال الرسالة بنجاح");

        setFormData({
          name: "",
          phone: "",
          message: "",
        });
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log("Contact error:", error);
      alert("حدث خطأ أثناء إرسال الرسالة");
    }
  };


  return (
    <section className="contact-section">

      <h2 className="title">تواصل معنا</h2>


      <div className="contact-container">


        <div className="contact-info">

          <div className="teacher-contact">

            <div className="teacher-contact-icon">
              <FaPhone />
            </div>

            <div className="teacher-contact-content">

              <span className="teacher-contact-label">
                للتواصل مع مستر أحمد
              </span>

              <a
                href="tel:+201029752665"
                className="teacher-phone"
              >
                01029752665
              </a>

              <span className="teacher-contact-hint">
                متاح للاستفسارات والحجز ,         اضغط على الرقم للاتصال مباشرة

              </span>

            </div>

          </div>


          <div className="social-buttons">

            {/* Facebook */}
            <a
              className="social-btn facebook"
              href="https://www.facebook.com/share/1G9XiAPPzV/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebook />
              Facebook
            </a>

            {/* WhatsApp */}
            <a
              className="social-btn whatsapp"
              href="https://wa.me/+201029752665"
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp />
              WhatsApp
            </a>

            {/* Telegram */}
            <a
              className="social-btn telegram"
              href="https://t.me/MrAhmedHagag"
              target="_blank"
              rel="noreferrer"
            >
              <FaTelegram />
              Telegram
            </a>

            {/* Instagram */}
            <a
              className="social-btn instagram"
              href="https://www.instagram.com/__7a_9a9__?igsh=MXZkZTZ0d3lxcXV3"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
              Instagram
            </a>

            {/* YouTube */}
            <a
              className="social-btn youtube"
              href="https://www.youtube.com/@AhmedHagag-d2w"
              target="_blank"
              rel="noreferrer"
            >
              <FaYoutube />
              YouTube
            </a>

          </div>

        </div>



        <form className="contact-form" onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />


          <input
            type="text"
            name="phone"
            placeholder="Your Phone"
            value={formData.phone}
            onChange={handleChange}
          />


          <textarea
            rows="6"
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
          />


          <button type="submit">
            Send Message
          </button>

        </form>


      </div>

    </section>
  );
}