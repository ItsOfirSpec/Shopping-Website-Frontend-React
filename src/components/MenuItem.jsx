import React from "react";
import { Link } from "react-router-dom";

export default function MenuItem({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex flex-row-reverse items-center space-x-2 space-x-reverse p-2 hover:bg-gray-100 rounded"
    >
      {icon && (
        <div
          className="w-5 h-5 flex-shrink-0 bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${icon})` }}
        />
      )}
      <span className="text-right" dir="rtl">{children}</span>
    </Link>
  );
}
