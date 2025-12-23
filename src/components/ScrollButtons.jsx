import { useState, useEffect } from "react";
import { FaArrowUp, FaStop } from "react-icons/fa";

export default function ScrollButtons({
  batchScrollEnabled,
  setBatchScrollEnabled,
}) {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showButtons) return null;

  return (
    <div
      className="fixed bottom-6 w-full flex flex-col items-center gap-4 z-50 pointer-events-none"
      style={{ zIndex: 99999 }}
    >
      <button
        onClick={scrollToTop}
        className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition pointer-events-auto border border-gray-200"
      >
        <FaArrowUp className="text-gray-800" />
      </button>


      {batchScrollEnabled && (
        <button
          onClick={() => setBatchScrollEnabled(false)}
          className="
      absolute top-3 right-3 
      flex items-center gap-2
      px-5 py-3
      rounded-2xl
      border border-red-300
      bg-red-500 text-white
      font-semibold text-sm
      shadow-md
      hover:bg-red-600 hover:shadow-lg
      active:scale-95
      transition-all duration-200 ease-out
      pointer-events-auto
    "
        >
          <FaStop className="text-white text-lg" />
          <span>עצור תצוגת מוצרים</span>
        </button>
      )}
    </div>
  );
}
