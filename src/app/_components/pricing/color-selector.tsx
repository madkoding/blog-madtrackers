// ColorSelector.tsx
import React, { useState } from "react";
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
  // El color de tapa y case se controlan con los selectores de botones
  // Los ABS White siempre serán blancos
  const absWhite1 = "#ffffff";
  const absWhite2 = "#ffffff";

  // El color de tapa y case se toma del color seleccionado en cada grupo
  // selectedColorTapa y selectedColorCase
  const [selectedColorTapa, setSelectedColorTapa] = useState(colors[0]);
  const [selectedColorCase, setSelectedColorCase] = useState(colors[0]);

  // Si la tapa seleccionada es blanca, el ABS White se ve negro
  const isTapaBlanca =
    selectedColorTapa.hex.toLowerCase() === "#ffffff" ||
    selectedColorTapa.hex.toLowerCase() === "ffffff";
  const absWhiteColor = isTapaBlanca ? "#000000" : "#ffffff";

  // Memo para evitar que RotatingFBXModel se reinicie al cambiar color
  const modelColors = React.useMemo(
    () => [
      selectedColorCase.hex,
      selectedColorTapa.hex,
      absWhiteColor,
      absWhiteColor,
    ],
    [selectedColorCase, selectedColorTapa, absWhiteColor]
  );

  return (
    <>
      <div className="mb-4">
        <h3 className="font-medium mb-2">
          Selecciona el color de la cubierta:
        </h3>
        <div className="grid grid-cols-5 gap-2 justify-center">
          {colors.map((color) => (
            <div key={color.id} className="flex justify-center items-center">
              <button
                key={color.id}
                className={`w-14 h-14 rounded-full border-2 ${color.color} ${
                  selectedColorTapa.id === color.id ? "ring-2 ring-black" : ""
                }`}
                onClick={() => setSelectedColorTapa(color)}
              ></button>
            </div>
          ))}
        </div>
        <br />
        <hr />
        <br />
        <h3 className="font-medium mb-2">Selecciona el color del case:</h3>
        <div className="grid grid-cols-5 gap-2 justify-center">
          {colors.map((color) => (
            <div key={color.id} className="flex justify-center items-center">
              <button
                key={color.id}
                className={`w-14 h-14 rounded-full border-2 ${color.color} ${
                  selectedColorCase.id === color.id ? "ring-2 ring-black" : ""
                }`}
                onClick={() => setSelectedColorCase(color)}
              ></button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="h-[350px] flex justify-center">
          <RotatingFBXModel colors={modelColors} />
        </div>
      </div>
    </>
  );
};

export default ColorSelector;
