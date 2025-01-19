import React from "react";
import SliderCaptcha from "@slider-captcha/react";

function CaptchaComponent() {
  const verifiedCallback = (token) => {
    console.log("Captcha token:", token);

    // Send token to the backend for further validation
    fetch("http://localhost:5002/captcha/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          alert("Captcha verified successfully!");
        } else {
          alert("Captcha verification failed.");
        }
      })
      .catch((error) => {
        console.error("Error verifying captcha:", error);
      });
  };

  return (
    <div>
      <h2>Complete the Captcha</h2>
      <SliderCaptcha
        create="http://localhost:5002/captcha/create"
        verify="http://localhost:5002/captcha/verify"
        callback={verifiedCallback}
        text={{ anchor: "I am human", challenge: "Slide to finish the puzzle" }}
        variant="dark" // Use 'light' for light theme
      />
    </div>
  );
}

export default CaptchaComponent;