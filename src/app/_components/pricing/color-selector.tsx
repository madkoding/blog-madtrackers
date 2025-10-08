// ColorSelector.tsx
import React, { useCallback, useMemo } from "react";
import { Color } from "../../types";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";
import RotatingModel from "../RotatingModel";

interface ColorSelectorProps {
  colors: Color[];
  selectedColorTapa: Color;
  selectedColorCase: Color;
  onColorTapaChange: (color: Color) => void;
  onColorCaseChange: (color: Color) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = React.memo(({
  colors,
  selectedColorTapa,
  selectedColorCase,
  onColorTapaChange,
  onColorCaseChange,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const handleColorTapaSelect = useCallback((color: Color) => {
    onColorTapaChange(color);
  }, [onColorTapaChange]);

  const handleColorCaseSelect = useCallback((color: Color) => {
    onColorCaseChange(color);
  }, [onColorCaseChange]);

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
          className={`w-14 h-14 rounded-full border-2 ${
            color.id === "white" ? "!bg-white border-gray-400 dark:border-slate-400" : color.color
          } ${
            selectedColorTapa.id === color.id ? "ring-2 ring-black dark:ring-white" : ""
          }`}
          onClick={() => handleColorTapaSelect(color)}
        ></button>
      </div>
    )), [colors, selectedColorTapa.id, handleColorTapaSelect]);

  const caseColorButtons = useMemo(() =>
    colors.map((color) => (
      <div key={color.id} className="flex justify-center items-center">
        <button
          className={`w-14 h-14 rounded-full border-2 ${
            color.id === "white" ? "!bg-white border-gray-400 dark:border-slate-400" : color.color
          } ${
            selectedColorCase.id === color.id ? "ring-2 ring-black dark:ring-white" : ""
          }`}
          onClick={() => handleColorCaseSelect(color)}
        ></button>
      </div>
    )), [colors, selectedColorCase.id, handleColorCaseSelect]);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-semibold">
          {t.customizeTracker}
        </h1>
      </div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold">
          {t.customizeTrackerDesc}
        </h3>
      </div>
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
