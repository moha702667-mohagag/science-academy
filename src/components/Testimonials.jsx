import { useState } from "react";
import "./Testimonials.css";

import img1 from "../assets/testimonials/img1.jpg";
import img2 from "../assets/testimonials/img2.jpg";
import img3 from "../assets/testimonials/img3.jpg";
import img4 from "../assets/testimonials/img4.jpg";
import img5 from "../assets/testimonials/img5.jpg";
import img6 from "../assets/testimonials/img6.jpg";

export default function Testimonials() {
  const [selectedImg, setSelectedImg] = useState(null);

  const images = [img1, img2, img3, img4, img5, img6];

  return (
    <section className="testimonials">
        <h2 className="title gradient-title">
        آراء الطلاب عن تجربة التعلم
        </h2>
      <div className="masonry">
        {images.map((img, i) => (
          <div className="review-card" key={i}>
            <img
              src={img}
              alt="student"
              onClick={() => setSelectedImg(img)}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div className="lightbox" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="preview" />
        </div>
      )}

    </section>
  );
}