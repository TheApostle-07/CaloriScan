import React from "react";
import "../styles/About.css"; // Add this for external styling

const About = () => {
  return (
    <div className="about-section">
      {/* About Section */}
      <h1 className="about-title">About CaloriScan</h1>
      <p className="about-description">
        CaloriScan is your go-to companion for scanning food items, tracking
        calories, and maintaining a healthy lifestyle. Whether you're striving
        for fitness or mindful eating, CaloriScan equips you with the tools to
        stay informed and motivated on your wellness journey.
      </p>

      {/* Social Links Section */}
      <section className="social-links">
        <h3>Connect with Us</h3>
        <div className="social-icons">
          <a
            href="https://github.com/TheApostle-07"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="devicon-github-plain"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/rufus-bright-77399a1a3/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="devicon-linkedin-plain"></i>
          </a>
          <a
            href="https://x.com/bright_ruf93341"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="devicon-twitter-original"></i>
          </a>
        </div>
      </section>

      {/* Technologies & Skills Section */}
      <section className="skills">
        <h3>Technologies & Skills</h3>
        <div className="tech-logos">
          {[
            { icon: "devicon-react-original", name: "React" },
            { icon: "devicon-nodejs-plain", name: "Node.js" },
            { icon: "devicon-express-original", name: "Express" },
            { icon: "devicon-mongodb-plain", name: "MongoDB" },
            { icon: "devicon-html5-plain", name: "HTML5" },
            { icon: "devicon-css3-plain", name: "CSS3" },
            { icon: "devicon-javascript-plain", name: "JavaScript" },
            { icon: "devicon-bootstrap-plain ", name: "Bootstrap" },
          ].map((tech, index) => (
            <div key={index} className="tech-item">
              <i className={`${tech.icon} colored`}></i>
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;