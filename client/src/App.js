import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css"; // Global styles
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import QRScanner from "./components/QRScanner";
import CalorieIdentify from "./pages/CalorieIdentify";
import About from "./pages/About"; // About page
import ContactUs from "./pages/ContactUs"; // Contact Us page

function App() {
  return (
    <div className="App">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <>
               

                {/* Scanner Section */}
                <section className="scanner-section">
              
                  <QRScanner />
                </section>
              </>
            }
          />

          {/* Calorie Identify Page */}
          <Route path="/calories" element={<CalorieIdentify />} />

          {/* About Page */}
          <Route path="/about" element={<About />} />

          {/* Contact Us Page */}
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;