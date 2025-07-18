// ColorSelector.tsx
import React, { useState, useCallback, useMemo } from "react";
import { Color } from "../../types";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";
import RotatingModel from "../RotatingModel";

interface ColorSelectorProps {
  colors: Color[];
}

const ColorSelector: React.FC<ColorSelectorProps> = React.memo(({
  colors,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const [selectedColorTapa, setSelectedColorTapa] = useState(colors[0]);
  const [selectedColorCase, setSelectedColorCase] = useState(colors[0]);

  const handleColorTapaSelect = useCallback((color: Color) => {
    setSelectedColorTapa(color);
  }, []);

  const handleColorCaseSelect = useCallback((color: Color) => {
    setSelectedColorCase(color);
  }, []);

  const isTapaBlanca = useMemo(() =>
    selectedColorTapa.hex.toLowerCase() === "#ffffff" ||
    selectedColorTapa.hex.toLowerCase() === "ffffff",
    [selectedColorTapa.hex]
  );
  
  const absWhiteColor = useMemo(() => 
    isTapaBlanca ? "#000000" : "#ffffff",
    [isTapaBlanca]
  );

  const modelColors = useMemo(() => [
      selectedColorCase.hex,
      selectedColorTapa.hex,
      absWhiteColor,
      absWhiteColor,
    ], [selectedColorCase.hex, selectedColorTapa.hex, absWhiteColor]);

  const tapaColorButtons = useMemo(() =>
    colors.map((color) => (
      <div key={color.id} className="flex justify-center items-center">
        <button
          className={`w-14 h-14 rounded-full border-2 ${color.color} ${
            selectedColorTapa.id === color.id ? "ring-2 ring-black" : ""
          }`}
          onClick={() => handleColorTapaSelect(color)}
        ></button>
      </div>
    )), [colors, selectedColorTapa.id, handleColorTapaSelect]);

  const caseColorButtons = useMemo(() =>
    colors.map((color) => (
      <div key={color.id} className="flex justify-center items-center">
        <button
          className={`w-14 h-14 rounded-full border-2 ${color.color} ${
            selectedColorCase.id === color.id ? "ring-2 ring-black" : ""
          }`}
          onClick={() => handleColorCaseSelect(color)}
        ></button>
      </div>
    )), [colors, selectedColorCase.id, handleColorCaseSelect]);

  return (
    <>
      <div className="mb-4">
        <h3 className="font-medium mb-2">{t.colorCover}</h3>
        <div className="grid grid-cols-5 gap-2 justify-center">
          {tapaColorButtons}
        </div>
        <br />
        <hr />
        <br />
        <h3 className="font-medium mb-2">{t.colorCase}</h3>
        <div className="grid grid-cols-5 gap-2 justify-center">
          {caseColorButtons}
        </div>
      </div>
      <div className="mb-4">
        <div className="h-[350px] flex justify-center">
          <RotatingModel colors={modelColors} />
        </div>
      </div>
    </>
  );
});

ColorSelector.displayName = 'ColorSelector';

export default ColorSelector;
