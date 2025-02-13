// Button.tsx
"use client";

import React from "react";

interface ButtonProps {
  text: string;
  link: string;
}

const Button: React.FC<ButtonProps> = ({ text, link }) => {
  return (
    <button
      onClick={() => window.open(link, "_blank")}
      className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-300 ease-in-out"
    >
      {text}
    </button>
  );
};

export default Button;
