// src/components/Layout/Loader.jsx
import React from "react";
import Lottie from "lottie-react";
import loader from "../../assets/loader.json";

const Loader = ({ fullscreen = true, size = 250 }) => { // 🔼 increased from 150 → 250
  return (
    <div
      className={`flex items-center justify-center ${
        fullscreen ? "fixed inset-0 bg-white/70 backdrop-blur-sm z-50" : ""
      }`}
    >
      <div style={{ width: size, height: size }}>
        <Lottie animationData={loader} loop={true} />
      </div>
    </div>
  );
};

export default Loader;