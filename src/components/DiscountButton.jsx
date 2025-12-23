import { useState } from "react";

export default function DiscountButton({ apiHost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      dir="rtl"
      className={`inline-flex items-center rounded-full px-6 py-2 text-[#333] font-semibold text-lg mb-5 transition-colors duration-200 ${
        hovered ? "bg-white" : "bg-[#FFF6DD]"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={
          hovered
            ? `${apiHost}/api/geticonimage/catanim/gif`
            : `${apiHost}/api/geticonimage/cartnone/avif`
        }
        alt="icon"
        className="w-6 h-6"
      />
      <span className="mr-2">עד 80% הנחה</span>
    </div>
  );
}
