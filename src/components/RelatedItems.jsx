import React from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/currency";

export default function RelatedItems({ items }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-9 gap-4 rtl">
      {items.map((item) => {
        const images = Array.isArray(item.images) ? item.images : JSON.parse(item.images || "[]");
        return (
          <div
            key={item.id}
            className="w-[200px] h-[300px] cursor-pointer border rounded shadow hover:shadow-lg transition flex flex-col"
            onClick={() => navigate(`/item/${item.id}`)}
          >
            <img
              src={images[0]}
              alt={item.title}
              className="w-full h-48 object-cover rounded-t"
            />
            <div className="p-2 text-sm font-semibold line-clamp-2">{item.title}</div>
            <div className="p-2 text-red-600 font-bold">{formatPrice(item.price)} ₪</div>
          </div>
        );
      })}
    </div>
  );
}
