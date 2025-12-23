import { useEffect, useState } from "react";

 export default function Countdown({ endTime, apiHost }) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const distance = new Date(endTime) - now;

      if (distance <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);
      } else {
        const h = String(Math.floor(distance / 3600000)).padStart(2, "0");
        const m = String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0");
        const s = String(Math.floor((distance % 60000) / 1000)).padStart(2, "0");
        setTimeLeft(`${h}:${m}:${s}`);
      }
    
    }
    const interval = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div
      dir="rtl"
      className={`inline-flex items-center rounded-full px-6 py-2 text-[#333] font-semibold text-lg transition-colors duration-200 mb-5 cursor-pointer select-none ${
        hovered ? "bg-white" : "bg-[#FEEBEB]"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={hovered ? `${apiHost}/api/geticonimage/clockanim/gif` : `${apiHost}/api/geticonimage/clock/avif`}
        alt="clock"
        className="w-6 h-6 ml-2"
      />
      <span>מסתיים ב- {timeLeft}</span>
    </div>
  );
}