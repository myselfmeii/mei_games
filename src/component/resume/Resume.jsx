import React from "react";
import "./resume.css";
import { useNavigate } from "react-router-dom";

const Resume = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate("/");
  };
  return (
    <div className="resume-container">
      <header className="resume-header">
        <h1>
          Mei{" "}
          <p style={{ fontWeight: 600, fontSize: 16, marginTop: -2 }}>
            {" "}
            Software Engineer{" "}
          </p>
        </h1>
      </header>

      <section
        className="contact-details blurred-contact"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p className="one-liner">
          📧 mei@gmail.com &nbsp;|&nbsp; 📱 +91-9876543XXX &nbsp;|&nbsp; 📍
          Chennai, India &nbsp;|&nbsp;
        </p>
      </section>

      <div className="blurred-content-wrapper">
        <div className="blur-gradient-overlay"></div>

        <section className="resume-section">
          <h2>👨‍💻 Profile Summary</h2>
          <p>
            Enthusiastic and detail-oriented Frontend Developer with strong
            skills in React.js, JavaScript, and modern web technologies. Looking
            for an opportunity to apply my skills in building responsive,
            accessible, and interactive web applications.
          </p>
        </section>

        <section className="resume-section">
          <h2>🛠 Skills</h2>
          <ul>
            <li>React.js</li>
            <li>JavaScript (ES6+)</li>
            <li>HTML5 & CSS3</li>
            <li>Git & GitHub</li>
            <li>REST APIs</li>
          </ul>
        </section>

        <section className="resume-section">
          <h2>🎓 Education</h2>
          <p>Bachelor of Computer Science — XYZ University (2019 - 2023)</p>
        </section>

        <section className="resume-section">
          <h2>💼 Projects</h2>
          <ul>
            <li>
              <strong>Personal Portfolio:</strong> A responsive portfolio built
              with React.js and CSS modules.
            </li>
            <li>
              <strong>Todo App:</strong> A simple todo list with CRUD operations
              and local storage.
            </li>
          </ul>
        </section>
      </div>
      <div className="blur-overlay">
        <div className="blur-overlay-content">
          Hire Me to Unlock
          <button className="exit-button" onClick={handleExit}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;
