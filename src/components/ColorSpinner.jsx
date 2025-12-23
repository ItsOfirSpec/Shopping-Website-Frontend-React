import { useMemo } from "react";
import "../styles/ColorSpinner.css";

export default function ColorSpinner({ text = "טוען...", color, randomColor = false }) {
  const finalColor = useMemo(() => {
    if (!randomColor) return color || "#4CAF50";

    const palette = [
      "#ff6b6b",
      "#4ecdff",
      "#ffcc4d",
      "#7d5fff",
      "#4CAF50",
      "#ff914d",
      "#ff3eae"
    ];

    return palette[Math.floor(Math.random() * palette.length)];
  }, [color, randomColor]);

  return (
    <div className="spinner-wrapper">
      <div className="spinner" style={{ borderTopColor: finalColor }}></div>
      <div className="spinner-text">{text}</div>
    </div>
  );
}
