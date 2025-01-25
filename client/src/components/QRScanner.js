import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FaQrcode, FaCamera,FaStop } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SliderCaptcha from "@slider-captcha/react"; // Import SliderCaptcha

import "../styles/QRScanner.css";
import "../styles/CalendarCounter.css"; // Custom CSS for calendar-style display



const QRScanner = () => {
  const [mode, setMode] = useState("idle"); // Modes: "idle", "scanning", "camera"
  const [decodedText, setDecodedText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [remainingTokens, setRemainingTokens] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false); // State to track captcha verification

  const [detectionResults, setDetectionResults] = useState(null); // For storing API response
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  // Start QR Scanner
  useEffect(() => {
    if (mode === "scanning") {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      scannerRef.current
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 16 / 9,
          },
          (decodedResult) => {
            console.log(`Code matched = ${decodedResult}`);
            setDecodedText(decodedResult);
            setStatusMessage("QR Code successfully decoded!");
            handleStopScanning();
            redirectToCaloriePage(decodedResult);
          },
          (errorMessage) => {
            if (errorMessage.includes("NotFoundException")) {
              setStatusMessage("No QR Code detected.");
            } else {
              console.warn(`Code scan error = ${errorMessage}`);
            }
          }
        )
        .catch((err) => console.error("Error starting scanner:", err));
    }

    return () => {
      if (scannerRef.current) {
        stopScanner(scannerRef.current);
      }
    };
  }, [mode]);

  // Stop QR Scanner
  const stopScanner = (scanner) => {
    if (scanner && scanner.isScanning) {
      scanner
        .stop()
        .then(() => {
          console.log("Scanner stopped successfully.");
          setStatusMessage("");
        })
        .catch((err) => console.warn("Error stopping scanner:", err));
    }
  };
  useEffect(() => {
    const fetchTokenStatus = async () => {
      const response = await axios.get("http://localhost:5002/api/token-status");
      // console.log(response.data.remainingTokens);
      setRemainingTokens(response.data.remainingTokens);
    };
  
    fetchTokenStatus();
  }, []);
  

  

  const handleStartScanning = () => {
    stopCamera(); // Ensure the camera is not active during scanning
    setCapturedImage(null);
    setStatusMessage("");
    setDecodedText("");
    setMode("scanning");
  };

  const handleStopScanning = () => {
    if (scannerRef.current) stopScanner(scannerRef.current);
    setMode("idle");
  };

  const redirectToCaloriePage = (data) => {
    try {
      const parsedData = JSON.parse(data);
      navigate("/calories", { state: { dishData: parsedData } });
    } catch (error) {
      console.error("Invalid QR Code data. Could not parse JSON:", error);
      setStatusMessage("Invalid QR Code data. Please try again.");
    }
  };

  // Handle Camera Mode
  const handleDetectCamera = async () => {
    setCapturedImage(null);
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setAvailableCameras(videoDevices);
      setSelectedCamera(videoDevices[0]?.deviceId || null);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatusMessage("Unable to access the camera. Please try again.");
    }
  };

  const handleSwitchCamera = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      videoRef.current.srcObject = stream;
      setSelectedCamera(deviceId);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  
  const handleCaptureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");
      setCapturedImage(imageDataUrl); // Set captured image
      stopCamera(); // Stop the camera after capturing

      // Send the captured image to the backend
      try {
        setStatusMessage("Processing image...");
        const response = await axios.post("http://localhost:5002/api/detect", {
          image: imageDataUrl.split(",")[1], // Send only the Base64 data
        });

        if (response.data && response.data.aiResponse) {
          // Successfully received AI response, navigate to "/calories"
          console.log(response.data.aiResponse)
          navigate("/calories", { state: { dishData: response.data.aiResponse } });
          
          setStatusMessage("Image processed successfully!");
        } else {
          // Handle case where no valid data is received
          setStatusMessage("No valid data received. Please try another image.");
          console.warn("No valid data received:", response.data);
        }
      } catch (error) {
        console.error("Error processing image:", error);
        setStatusMessage("Failed to process image.");
      }

      setMode("idle");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "#fff" }}>
  {mode === "idle" && "Welcome to CaloriScan"}
  {mode === "scanning" && "QR Code Scanner"}
  {mode === "camera" && "Food Detector"}
</h1>

<p>
                      Your ultimate companion for tracking calories. Scan your
                      dishes and stay on top of your health journey.
                    </p>

                    <div className="calendar-counter">
        {remainingTokens !== null ? (
          <>
             <div className="calendar-counter">
        <div className="token-day">
          <span>{remainingTokens !== null ? remainingTokens : "Loading..."}</span>
          <p>{remainingTokens > 0 ? "Detector tokens available!" : "Limit reached. Please wait until reset."}</p>
        </div>
      </div>
          </>
        ) : (
          <p>Loading token status...</p>
        )}
      </div>



      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "20px 0",
          gap: "20px",
        }}
      >
        {mode === "idle" && (
          <>
            <button
              onClick={handleStartScanning}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "30px",
                color: "#000",
                
                cursor: "pointer",
                gap: "10px",
              }}
            >
              <FaQrcode size={20} /> Scan
            </button>
            <button
              onClick={handleDetectCamera}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "30px",
                color: "#000",
               
                cursor: "pointer",
                gap: "10px",
              }}
            >
              <FaCamera size={20} /> Detect
            </button>
          </>
        )}

        {mode === "camera" && (
          <button
            onClick={handleCaptureImage}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 20px",
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "30px",
              color: "#000",
              fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
              cursor: "pointer",
              gap: "8px",
            }}
          >
            <FaCamera size={20} /> Capture
          </button>
        )}

        {mode === "scanning" && (
          <button
            onClick={handleStopScanning}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 20px",
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "30px",
              color: "#000",
              fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
              cursor: "pointer",
              gap: "8px",
            }}
          >
            <FaStop size={20} />Stop
          </button>
        )}
      </div>

      {mode === "camera" && !capturedImage && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            style={{
              width: "100%",
              maxWidth: "400px",
              objectFit: "cover",

              aspectRatio: "1/1",
              border: "2px solid white",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          ></video>
          {availableCameras.length > 1 && (
            <select
              onChange={(e) => handleSwitchCamera(e.target.value)}
              value={selectedCamera}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
              }}
            >
              {availableCameras.map((camera, index) => (
                <option key={index} value={camera.deviceId}>
                  {camera.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {capturedImage && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: "100%",
              maxWidth: "400px",
              border: "4px solid white",
              borderRadius: "10px",
            }}
          />
        </div>
      )}

      {detectionResults && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f4f4f4",
            border: "1px solid #ccc",
            borderRadius: "10px",
            textAlign: "left",
            fontSize: "clamp(0.8rem, 1.2vw, 1rem)",
          }}
        >
          <h2 style={{ color: "#003459" }}>Detection Results</h2>
          <p><strong>Detected Objects:</strong> {detectionResults.detectedObjects?.join(", ")}</p>
          <p><strong>AI Response:</strong></p>
          <p style={{ whiteSpace: "pre-wrap" }}>{detectionResults.aiResponse}</p>
        </div>
      )}

      {mode === "scanning" && (
      <div
      id="qr-reader"
      style={{
        width: "100%",
        maxWidth: "400px",
        maxHeight: "400px",
        aspectRatio: "16/9", // Ensures a square container
        margin: "20px auto",
        border: "4px solid var(--white)", // Consistent with theme
        borderRadius: "10px",
        boxSizing: "border-box",
        overflow: "hidden", // Hides any overflow
        backgroundColor: "var(--rich-black)", // Matches the theme
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          aspectRatio: "1/1",// Ensures the height adjusts dynamically
          minHeight: "100%", // Prevents black bars by stretching to fill
          objectFit: "cover", // Crops the video to fill the container
        }}
      ></video>
    </div>
      )}

      {statusMessage && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: statusMessage.includes("success") ? "#007ea7" : "#fca311",
            color: "#fff",
            borderRadius: "5px",
            display: "inline-block",
            fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
