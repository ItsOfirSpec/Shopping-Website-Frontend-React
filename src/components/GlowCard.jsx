import { useRef, useState } from "react";

export default function GlowCard({ children, className = "", style, variant = "gray" }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    aqua: "rgba(0,255,241,1)",
    red: "rgba(255,0,0,1)",
    green: "rgba(0,255,0,1)",
    gray: "#FFFFFF"
  };

  const backgroundHoverColors = {
    aqua: "rgba(0,255,241,0.2)",
    red: "rgba(255,0,0,0.2)",
    green: "rgba(0,255,0,0.2)",
    gray: "#f7f7f7ff"
  };

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty("--xPos", `${x}px`);
    ref.current.style.setProperty("--yPos", `${y}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glow-card ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        transition: "0.3s",
        cursor: "pointer",
        backgroundColor: isHovered
          ? backgroundHoverColors[variant] || "#E5E7EB"
          : "#FFFFFF",
        ...style
      }}
    >
      <div
        style={{
          position: "absolute",
          height: "500px",
          width: "500px",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255,255,255,0.25)",
          mixBlendMode: "overlay",
          pointerEvents: "none",
          transition: "opacity 0.3s",
          opacity: isHovered ? 1 : 0
        }}
        className="dm-glowy-circle"
      />


      <div
        style={{
          position: "relative",
          zIndex: 2,
          borderRadius: "inherit",
          padding: "20px"
        }}
      >
        {children}
      </div>


      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(250px circle at var(--xPos) var(--yPos), ${colors[variant]}, transparent 80%)`,
          transition: "background 0.3s"
        }}
      />
    </div>
  );
}
