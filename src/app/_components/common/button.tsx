// Button.tsx
"use client";

import React, { useCallback } from "react";

interface ButtonProps {
  text: string;
  link: string;
}

const Button: React.FC<ButtonProps> = React.memo(({ text, link }) => {
  const handleClick = useCallback(() => {
    window.open(link, "_blank");
  }, [link]);

  return (
    <button
      onClick={handleClick}
      className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-300 ease-in-out"
    >
      {text}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
