// ColorSelector.tsx
import React from "react";
import RotatingFBXModel from "../RotatingFBXModel";
import { Color } from "../../types";

type ColorSelectorProps = {
  colors: Color[];
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
};

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  setSelectedColor,
}) => {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Color:</h3>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 justify-center">
        {colors.map((color) => (
          <div key={color.id} className="flex justify-center items-center">
            <button
              key={color.id}
              className={`w-14 h-14 rounded-full border-2 ${color.color} ${
                selectedColor.id === color.id ? "ring-2 ring-black" : ""
              }`}
              onClick={() => setSelectedColor(color)}
            ></button>
          </div>
        ))}
      </div>
      <div className="h-[250px] w-full flex justify-center">
        <RotatingFBXModel color={selectedColor.hex} />
      </div>
    </div>
  );
};

export default ColorSelector;
