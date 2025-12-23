import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import categories from "../categories/categories.js";

export default function CategoryBar() {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState([0, categories.length]);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCatId, setActiveCatId] = useState(null);

  useEffect(() => {
    const match = location.pathname.match(/\/category\/(\d+)/);
    if (match) {
      setActiveCatId(parseInt(match[1], 10));
    } else {
      setActiveCatId(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const categoryWidth = 100;
      const maxVisibleCount = Math.floor(containerWidth / categoryWidth);
      if (maxVisibleCount >= categories.length) {
        setVisibleRange([0, categories.length]);
      } else {
        const start = Math.floor((categories.length - maxVisibleCount) / 2);
        setVisibleRange([start, start + maxVisibleCount]);
      }
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth >= 768) setBurgerOpen(false);
      updateVisibleRange();
    };

    const intervalId = setInterval(handleResize, 200);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="bg-gray-100 border-t border-gray-200 rtl">
      {isDesktop && (
        <div
          ref={containerRef}
          className="md:flex hidden py-2 justify-center transition-all duration-300 overflow-hidden shadow-sm"
          style={{ background: "#f9f9f9", borderBottom: "2px solid #c5c5c5" }}
        >
          {categories.map((cat, idx) => {
            const visible = idx >= visibleRange[0] && idx < visibleRange[1];
            const isActive = cat.id === activeCatId;

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className={`flex flex-col items-center text-sm mx-2
                  flex-shrink-0 text-center transition-all duration-300 ease-in-out
                  cursor-pointer select-none group
                  ${
                    visible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-75 pointer-events-none"
                  }
                  hover:bg-gray-200 hover:rounded-md px-2 py-1
                  ${isActive ? "bg-gray-200 rounded-md" : ""}`}
                style={{ minWidth: "60px", maxWidth: "116px" }}
              >
                <div
                  className="w-6 h-6 mb-1 bg-center bg-contain bg-no-repeat"
                  style={{ backgroundImage: `url(${cat.icon})` }}
                  aria-label={cat.name}
                />
                <span className="text-gray-700 whitespace-nowrap">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div
        className="md:hidden px-4 py-2 flex justify-between items-center shadow-sm"
        style={{ background: "#f9f9f9", borderBottom: "2px solid #c5c5c5" }}
      >
        <span className="mx-2 text-sm">קטגוריות</span>
        <button
          onClick={() => setBurgerOpen(!burgerOpen)}
          className="text-gray-700 font-bold text-2xl p-2 transition-all duration-200 active:scale-90"
        >
          {burgerOpen ? "×" : "☰"}
        </button>
      </div>

      <div
        style={{ background: "#f9f9f9" }}
        className={`md:hidden px-4 pb-4 grid grid-cols-3 gap-4 transition-all duration-300 ${
          burgerOpen
            ? "opacity-100 max-h-[500px]"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCatId;
          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className={`flex flex-col items-center text-xs cursor-pointer select-none transition-all duration-200 hover:bg-gray-200 hover:rounded-md p-2 ${
                isActive ? "bg-gray-200 rounded-md" : ""
              }`}
            >
              <img src={cat.icon} alt={cat.name} className="w-7 h-7 mb-1" />
              <span className="text-gray-700">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
