import React from "react";

const LoadingSpinner: React.FC = React.memo(() => (
  <svg
    style={{
      width: 48,
      height: 48,
      color: "#fff",
      animation: "spin 1s linear infinite",
    }}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeDasharray="31.4 31.4"
      strokeDashoffset="0"
      opacity="0.3"
    />
    <path
      d="M45 25a20 20 0 1 1-20-20"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="1"
    />
  </svg>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
