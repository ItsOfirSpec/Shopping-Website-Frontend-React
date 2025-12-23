import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import { useItemById, useItemsBySimilar } from "../items/items";
import ErrorPage from "../components/ErrorPage";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import ColorSpinner from "../components/ColorSpinner";

export default function Similar() {
  const { id } = useParams();
  const similarId = parseInt(id, 10);
  const { items, loading, error } = useItemsBySimilar(similarId);
  const { idItem, itemLoading, itemError } = useItemById(similarId);

  const navigate = useNavigate();


  if (itemError) {
    return (
      <ErrorPage
        status={404}
        message="המוצר שחיפשת לא קיים."
        actionText="חזור לדף הראשי"
        actionLink="/"
      />
    );
  }

  if (loading || itemLoading) return <ColorSpinner text="" randomColor />;

  if (error)
    return (
      <ErrorPage
        status={500}
        message="שגיאה בטעינת המוצרים"
        details={error}
        actionText="חזור למסך הראשי"
        actionLink="/"
      />
    );
  return (
    <div className="p-4 rtl" dir="rtl">
      {idItem && (
        <div className="mb-6">
          <div
            onClick={() => navigate(`/item/${idItem.id}`)}
            className="flex flex-col items-end cursor-pointer border rounded p-1 hover:shadow-md transition-shadow duration-200"
            style={{
              maxWidth: "150px",
              width: "100%",
              marginLeft: "auto",
            }}
          >
            {idItem.images && idItem.images.length > 0 && (
              <img
                src={idItem.images[0]}
                alt={idItem.title}
                className="w-full h-32 object-cover rounded mb-1"
              />
            )}
            <span className="text-right font-medium text-sm">
              {idItem.title}
            </span>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">מוצרים הדומים למוצר זה</h1>
      

      {items.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">אין מוצרים להציג.</div>
      ) : (
        <div
          className="grid justify-center"
          style={{
            gridTemplateColumns: "repeat(auto-fill, 258px)",
            gap: "15px",
          }}
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
