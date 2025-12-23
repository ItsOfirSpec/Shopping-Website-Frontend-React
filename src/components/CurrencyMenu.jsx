import React, { useEffect, useRef, useState } from "react";

export const currencySymbols = {
  ILS: "₪",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "$",
};

const currencyNames = {
  ILS: "שקל",
  USD: "דולר",
  EUR: "אירו",
  GBP: "לירה שטרלינג",
  JPY: "ין",
  CAD: "דולר קנדי",
};

export default function CurrencyMenu({ onClose }) {
  const menuRef = useRef(null);

  const currencies = ["ILS", "USD", "EUR", "GBP", "JPY", "CAD"];

  const [selectedCurrency, setSelectedCurrency] = useState(
    localStorage.getItem("preferredCurrency") || "ILS"
  );

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSelect = (currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem("preferredCurrency", currency);

    window.dispatchEvent(new Event("currencyChanged"));

    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-12 left-0 w-52 bg-white shadow-lg rounded-2xl border border-gray-200 z-50 rtl"
    >
      <div className="flex flex-col p-2 space-y-1">
        {currencies.map((currency) => {
          const isActive = selectedCurrency === currency;

          return (
            <button
              key={currency}
              onClick={() => handleSelect(currency)}
              dir="rtl"
              className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-all 
                ${
                  isActive
                    ? "bg-gray-800 text-white font-semibold"
                    : "hover:bg-gray-200 text-gray-800"
                }
              `}
            >
              <span>{currencyNames[currency]}</span>
              <span className="text-lg">{currencySymbols[currency]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
